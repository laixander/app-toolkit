<script setup lang="ts">
definePageMeta({
    title: 'Clockify Exporter',
    headerActions: [
        // { label: 'Export All', icon: 'i-lucide-download', event: 'exportAll', color: 'primary' },
        { label: 'Reset', icon: 'i-lucide-rotate-ccw', event: 'reset', color: 'neutral' },
        { label: 'History', icon: 'i-lucide-history', event: 'viewLogs' }
    ]
})

const toast = useToast()
const events = useEvents()
const logger = useLogger()
const isDrawerOpen = ref(false)
events.on('viewLogs', () => {
    isDrawerOpen.value = true
})
// events.on('exportAll', () => {
//     logger.addLog('Export All action triggered from header', 'info')
//     toast.add({ title: 'Export All', description: 'This feature is coming soon!', color: 'info' })
// })
events.on('reset', () => {
    // 1. Reset API and Workspace data
    apiKey.value = ''
    workspaces.value = []
    selectedWorkspace.value = null
    feedback.value = ''

    // 2. Reset User data
    users.value = []
    currentUser.value = null
    selectedUser.value = null

    // 3. Reset Time Entries and Date Range
    entries.value = []
    timeFeedback.value = ''
    const now = today(tz)
    dateRange.value = {
        start: now.subtract({ days: 14 }),
        end: now
    }

    // 4. Reset Manual Entry Form
    newEntry.value = { desc: '' }
    entryDate.value = null
    entryTimes.value = {
        start: new Time(9, 0),
        end: new Time(17, 0)
    }

    // 5. Reset Export state
    isExported.value = false
    selectedTheme.value = availableThemes[0]

    logger.addLog('Application state reset to defaults', 'warn')
    toast.add({ title: 'Reset Successful', description: 'Application state has been cleared.', color: 'success' })
})

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

import { ref, computed, watch, shallowRef, useTemplateRef, onMounted } from 'vue'

onMounted(() => {
    logger.addLog('Clockify Exporter initialized', 'info')
})
import ExcelJS from 'exceljs'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { DateFormatter, getLocalTimeZone, today, Time, type CalendarDate } from '@internationalized/date'


interface Workspace {
    id: string
    name: string
}
interface ClockifyUser {
    id: string
    name: string
    email: string
}
interface TimeEntry {
    description: string
    timeInterval: { start: string; end: string }
}

const apiKey = ref('')
const workspaces = ref<Workspace[]>([])
const selectedWorkspace = ref<Workspace | null>(null)
const feedback = ref('')
const users = ref<ClockifyUser[]>([])
const currentUser = ref<ClockifyUser | null>(null)
const selectedUser = ref<ClockifyUser | null>(null)
const timeFeedback = ref('')
const newEntry = ref({
    desc: ''
})
const entryDate = shallowRef<CalendarDate | null>(null)
const entryTimes = shallowRef({
    start: new Time(9, 0),
    end: new Time(17, 0)
})
const exportFileName = ref('Accomplishment Report ([start date] Week#) - Last Name, First Name')
const isExported = ref(false)

const availableThemes = [
    { label: 'Green (Default)', value: 'TableStyleMedium9' as const, color: 'bg-green-500', previewColor: '#E2EFDA', darkPreviewColor: '#064E3B' },
    { label: 'Blue', value: 'TableStyleMedium2' as const, color: 'bg-blue-500', previewColor: '#DDEBF7', darkPreviewColor: '#1E3A8A' },
    { label: 'Orange', value: 'TableStyleMedium3' as const, color: 'bg-orange-500', previewColor: '#FFF2CC', darkPreviewColor: '#7C2D12' },
    { label: 'Gray', value: 'TableStyleMedium1' as const, color: 'bg-gray-500', previewColor: '#EDEDED', darkPreviewColor: '#262626' },
    { label: 'Dark', value: 'TableStyleDark1' as const, color: 'bg-slate-900', previewColor: '#D9D9D9', darkPreviewColor: '#0F172A' }
]
const selectedTheme = ref(availableThemes[0])

/* Date Range Picker Logic */
const df = new DateFormatter('en-US', { dateStyle: 'medium' })
const tz = getLocalTimeZone()
const breakpoints = useBreakpoints(breakpointsTailwind)
const isDesktop = breakpoints.greaterOrEqual('sm')

const ranges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 14 days', days: 14 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 3 months', months: 3 },
    { label: 'Last 6 months', months: 6 },
    { label: 'Last year', years: 1 }
]

const initialEnd = today(tz)
const dateRange = shallowRef({
    start: initialEnd.subtract({ days: 14 }),
    end: initialEnd
})

const inputDate = useTemplateRef('inputDate')
const entryDateInput = useTemplateRef('entryDateInput')

const startDate = computed(() => dateRange.value.start?.toString() || '')
const endDate = computed(() => dateRange.value.end?.toString() || '')

const dateLabel = computed(() => {
    const { start, end } = dateRange.value
    if (!start) return 'Pick a date'
    if (!end) return df.format(start.toDate(tz))
    return `${df.format(start.toDate(tz))} - ${df.format(end.toDate(tz))}`
})

function computeStart(range: (typeof ranges)[number]) {
    const end = today(tz)
    return { start: end.subtract({ days: range.days || 0, months: range.months || 0, years: range.years || 0 }), end }
}

function isRangeSelected(range: (typeof ranges)[number]) {
    if (!dateRange.value?.start || !dateRange.value?.end) return false
    const { start, end } = computeStart(range)
    return dateRange.value.start.compare(start) === 0 && dateRange.value.end.compare(end) === 0
}

function selectRange(range: (typeof ranges)[number]) {
    dateRange.value = computeStart(range)
}

const entries = ref<TimeEntry[]>([])

/**
 * Computed property to group and format time entries for display and export.
 * This avoids redundant calculations and keeps the logic centralized.
 */
const formattedRows = computed(() => {
    if (!entries.value.length) return []

    const grouped: Record<string, TimeEntry[]> = {}

    // Group entries by date
    for (const e of entries.value) {
        const start = e.timeInterval?.start
        if (!start) continue
        const key = start.slice(0, 10)
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(e)
    }

    const rows: {
        date: string
        desc: string
        start: string
        end: string
        total: string
        isTotal: boolean
    }[] = []

    // Sort dates and flatten into rows
    for (const dateKey of Object.keys(grouped).sort()) {
        const dayEntries = grouped[dateKey] ?? []
        let dayTotalSeconds = 0

        for (const e of dayEntries) {
            const start = new Date(e.timeInterval.start)
            const end = new Date(e.timeInterval.end)
            const durationSeconds = (end.getTime() - start.getTime()) / 1000
            dayTotalSeconds += durationSeconds

            rows.push({
                date: start.toLocaleDateString(),
                desc: e.description,
                start: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                end: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                total: secondsToDuration(durationSeconds),
                isTotal: false
            })
        }

        // Add summary row for the day
        rows.push({
            date: '',
            desc: `Total for ${new Date(dateKey).toLocaleDateString()}`,
            start: '',
            end: '',
            total: secondsToDuration(dayTotalSeconds),
            isTotal: true
        })
    }

    return rows
})

const workspaceOptions = computed(() => workspaces.value.map(ws => ({ label: ws.name, value: ws.id })))

const selectedWorkspaceId = computed({
    get: () => selectedWorkspace.value?.id,
    set: (id) => {
        const ws = workspaces.value.find(w => w.id === id)
        if (ws) selectWorkspace(ws)
    }
})

const userOptions = computed(() => users.value.map(u => ({
    label: `${u.name} (${u.email})`,
    value: u,
    disabled: currentUser.value ? u.id !== currentUser.value.id : false
})))

const selectedUserOption = computed({
    get: () => {
        if (!selectedUser.value) return undefined
        return userOptions.value.find(opt => opt.value.id === selectedUser.value?.id)
    },
    set: (opt) => {
        selectedUser.value = opt ? opt.value : null
    }
})

/* Helpers */
const secondsToDuration = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    return `${h}h ${m}m ${sec}s`
}

/* 1. Workspaces */
async function fetchWorkspaces() {
    // if (!apiKey.value) return alert('Please enter API Key')
    feedback.value = 'Loading...'
    try {
        const res = await fetch('https://api.clockify.me/api/v1/workspaces', {
            headers: { 'X-Api-Key': apiKey.value }
        })
        if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`)
        workspaces.value = await res.json()
        feedback.value = 'Workspaces fetched successfully!'
        logger.addLog(`Fetched ${workspaces.value.length} workspaces`, 'info')

        // Fetch current user profile
        try {
            const userRes = await fetch('https://api.clockify.me/api/v1/user', {
                headers: { 'X-Api-Key': apiKey.value }
            })
            if (userRes.ok) currentUser.value = await userRes.json()
        } catch (err) {
            console.error('Error fetching current user', err)
        }
    } catch (err: any) {
        console.error(err)
        feedback.value = err.message || 'Error fetching workspaces.'
        logger.addLog(`Workspace fetch error: ${feedback.value}`, 'error')
    }
}

function selectWorkspace(ws: Workspace) {
    selectedWorkspace.value = ws
    feedback.value = `Selected workspace: ${ws.name}`
    selectedUser.value = null
    users.value = []
    fetchUsers()
}

/* 2. Users */
const loadingUsers = ref(false)

async function fetchUsers() {
    if (!selectedWorkspace.value) return
    loadingUsers.value = true
    try {
        const res = await fetch(
            `https://api.clockify.me/api/v1/workspaces/${selectedWorkspace.value.id}/users?page-size=100`,
            { headers: { 'X-Api-Key': apiKey.value } }
        )
        if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`)
        users.value = await res.json()

        // Auto-select current user
        if (currentUser.value) {
            const me = users.value.find(u => u.id === currentUser.value?.id)
            if (me) selectedUser.value = me
        }
        logger.addLog(`Fetched ${users.value.length} users for workspace ${selectedWorkspace.value.name}`, 'info')
    } catch (err: any) {
        console.error('Error fetching users', err)
        feedback.value = err.message || 'Error fetching users.'
        logger.addLog(`User fetch error: ${feedback.value}`, 'error')
    } finally {
        loadingUsers.value = false
    }
}

function selectUser(user: ClockifyUser) {
    selectedUser.value = user
}


/* 3. Time Entries */
async function fetchTimeEntries() {
    if (!selectedWorkspace.value || !selectedUser.value) {
        toast.add({ title: 'Validation Error', description: 'Please select a workspace and user first.', color: 'error' })
        return
    }
    if (!startDate.value || !endDate.value) {
        toast.add({ title: 'Validation Error', description: 'Please select a date range.', color: 'error' })
        return
    }

    timeFeedback.value = 'Loading...'
    try {
        const startISO = new Date(startDate.value + 'T00:00:00Z').toISOString()
        const endISO = new Date(endDate.value + 'T23:59:59Z').toISOString()
        const res = await fetch(
            `https://api.clockify.me/api/v1/workspaces/${selectedWorkspace.value.id}/user/${selectedUser.value.id}/time-entries?start=${startISO}&end=${endISO}&page-size=1000`,
            { headers: { 'X-Api-Key': apiKey.value } }
        )
        if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`)
        entries.value = await res.json()
        timeFeedback.value = `Successfully fetched ${entries.value.length} entries.`
        logger.addLog(`Fetched ${entries.value.length} time entries for ${selectedUser.value.name}`, 'info')
        toast.add({ title: 'Success', description: 'Time entries updated.', color: 'success' })
    } catch (err: any) {
        console.error(err)
        timeFeedback.value = err.message || 'Error fetching entries.'
        logger.addLog(`Entry fetch error: ${timeFeedback.value}`, 'error')
        toast.add({ title: 'Fetch Error', description: timeFeedback.value, color: 'error' })
    }
}

/* 4. Add Entry */
function addEntry() {
    if (!entryDate.value || !newEntry.value.desc) {
        toast.add({ title: 'Missing Info', description: 'Fill in date and description.', color: 'warning' })
        return
    }
    const dateStr = entryDate.value.toString()
    const startISO = new Date(`${dateStr}T${entryTimes.value.start.toString()}:00`).toISOString()
    const endISO = new Date(`${dateStr}T${entryTimes.value.end.toString()}:00`).toISOString()
    entries.value.push({
        description: newEntry.value.desc,
        timeInterval: { start: startISO, end: endISO }
    })
    const addedDesc = newEntry.value.desc
    newEntry.value = { desc: '' }
    entryDate.value = null
    logger.addLog(`Manually added entry: ${addedDesc}`, 'info')
    toast.add({ title: 'Entry Added', description: 'Manual entry added to the list.', color: 'success' })
}

const previewHtml = computed(() => {
    if (formattedRows.value.length === 0) return '<p class="p-4 text-center text-muted">No entries to preview.</p>'

    const themeColor = isDark.value
        ? (selectedTheme.value?.darkPreviewColor || '#064E3B')
        : (selectedTheme.value?.previewColor || '#E2EFDA')

    const textColor = isDark.value ? '#FFFFFF' : '#000000'
    const borderColor = isDark.value ? '#444444' : '#CCCCCC'

    let html = `
    <table border="1" style="border-collapse:collapse;width:100%;text-align:center;color:${textColor};border-color:${borderColor};">
      <tr style="background:${themeColor};"><th colspan="5" style="padding:10px">Weekly Accomplishment Report</th></tr>
      <tr style="background:${themeColor};"><th colspan="5" style="padding:10px">Period covered: ${startDate.value || 'N/A'} - ${endDate.value || 'N/A'}</th></tr>
      <tr style="background:${themeColor}; font-weight: bold;">
        <th style="padding:8px">Date Entered</th><th style="padding:8px">Description</th><th style="padding:8px">Start Time</th><th style="padding:8px">End Time</th><th style="padding:8px">Total Time</th>
      </tr>`

    for (const r of formattedRows.value) {
        const bg = r.isTotal ? ` style="background:${themeColor}; font-weight: bold;"` : ''
        html += `<tr${bg}><td style="padding:8px">${r.date}</td><td style="padding:8px">${r.desc}</td><td style="padding:8px">${r.start}</td><td style="padding:8px">${r.end}</td><td style="padding:8px">${r.total}</td></tr>`
    }
    html += '</table>'
    return html
})

/* 5. Export Excel */
async function exportExcel() {
    if (formattedRows.value.length === 0) {
        toast.add({ title: 'Export Error', description: 'No entries to export.', color: 'error' })
        return
    }

    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('TimeEntries')

    // Set column widths
    ws.columns = [
        { key: 'date', width: 16.88 },
        { key: 'desc', width: 53.13 },
        { key: 'start', width: 14.38 },
        { key: 'end', width: 14.38 },
        { key: 'total', width: 14.38 }
    ]

    // 1. Add Title Row
    const titleRow = ws.addRow(['Weekly Accomplishment Report'])
    ws.mergeCells('A1:E1')
    titleRow.eachCell((c) => {
        c.font = { bold: true, size: 14 }
        c.alignment = { horizontal: 'center' }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
    })

    // 2. Add Period Row
    const periodRow = ws.addRow([`Period covered: ${startDate.value || 'N/A'} - ${endDate.value || 'N/A'}`])
    ws.mergeCells('A2:E2')
    periodRow.eachCell((c) => {
        c.font = { bold: true, size: 12 }
        c.alignment = { horizontal: 'center' }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
    })

    // 3. Add the Native Table
    ws.addTable({
        name: 'AccomplishmentTable',
        ref: 'A3',
        headerRow: true,
        style: {
            theme: (selectedTheme.value?.value || 'TableStyleMedium9') as any, // Use the selected theme
            showRowStripes: true,
        },
        columns: [
            { name: 'Date Entered' },
            { name: 'Description' },
            { name: 'Start Time' },
            { name: 'End Time' },
            { name: 'Total Time' }
        ],
        rows: formattedRows.value.map(r => [r.date, r.desc, r.start, r.end, r.total])
    })

    // 4. Add Conditional Formatting for "Total" rows
    const lastRow = formattedRows.value.length + 3
    ws.addConditionalFormatting({
        ref: `A4:E${lastRow}`,
        rules: [
            {
                priority: 1,
                type: 'expression',
                formulae: ['NOT(ISERR(SEARCH("Total for", $B4)))'],
                style: {
                    fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFE2EFDA' } },
                    font: { bold: true }
                }
            }
        ]
    })

    const buf = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFileName.value}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    logger.addLog(`Exported ${formattedRows.value.length} rows to ${exportFileName.value}.xlsx`, 'info')
    isExported.value = true
}

/* Auto-update export file name */
watch(startDate, (v) => {
    if (v)
        exportFileName.value = `Accomplishment Report (${new Date(v).toLocaleDateString()} Week#) - Last Name, First Name`
})

watch(entries, () => {
    isExported.value = false
}, { deep: true })
</script>
<template>
    <UPage title="Clockify Exporter" description="Export Clockify time entries to Excel">
        <div class="space-y-6">

            <!-- 1. API Key & Workspace -->
            <UCard variant="soft" :ui="{ body: 'flex flex-col gap-4' }">
                <div class="flex items-center gap-3">
                    <div :class="[
                        'flex items-center justify-center font-semibold w-10 h-10 rounded-xl transition-all duration-300',
                        selectedWorkspace ? 'bg-primary/15 dark:bg-primary-500/20 text-primary dark:text-primary-400' : 'bg-primary dark:bg-primary-900 text-white'
                    ]">
                        <UIcon v-if="selectedWorkspace" name="i-ph-check-bold" class="size-5" />
                        <span v-else>1</span>
                    </div>
                    <div>
                        <div class="font-semibold">Workspace</div>
                        <div class="text-muted text-sm">Enter API Key and Select Workspace</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <UFieldGroup size="lg" class="w-full">
                        <UInput v-model="apiKey" placeholder="API Key" class="w-full" />
                        <UButton label="Fetch Workspaces" icon="i-ph-arrows-counter-clockwise-fill" variant="soft"
                            @click="fetchWorkspaces" :disabled="!apiKey" />
                    </UFieldGroup>
                </div>

                <USeparator v-if="feedback" />

                <div class="flex flex-col w-full gap-3">
                    <URadioGroup v-if="workspaces.length" v-model="selectedWorkspaceId" :items="workspaceOptions"
                        variant="table" orientation="horizontal" size="sm" />
                    <div class="text-sm text-primary">{{ feedback }}</div>
                </div>

            </UCard>

            <!-- <USeparator v-if="selectedWorkspace" /> -->

            <!-- 2. Search User -->
            <UCard v-if="selectedWorkspace" variant="soft" :ui="{ body: 'flex flex-col gap-4' }">
                <div class="flex items-center gap-3">
                    <div :class="[
                        'flex items-center justify-center font-semibold w-10 h-10 rounded-xl transition-all duration-300',
                        selectedUser ? 'bg-primary/15 dark:bg-primary-500/20 text-primary dark:text-primary-400' : 'bg-primary dark:bg-primary-900 text-white'
                    ]">
                        <UIcon v-if="selectedUser" name="i-ph-check-bold" class="size-5" />
                        <span v-else>2</span>
                    </div>
                    <div>
                        <div class="font-semibold">User</div>
                        <div class="text-muted text-sm">Search User by Name or Email</div>
                    </div>
                </div>

                <USelectMenu v-model="selectedUserOption" :items="userOptions" :loading="loadingUsers"
                    placeholder="Select a user..." searchable size="lg" class="w-full" icon="i-ph-user" />
            </UCard>

            <!-- <USeparator v-if="selectedUser" /> -->

            <!-- 3. Selected User & Date Range -->
            <UCard v-if="selectedUser" variant="soft" :ui="{ body: 'flex flex-col gap-4' }">
                <div class="flex items-center gap-3">
                    <div :class="[
                        'flex items-center justify-center font-semibold w-10 h-10 rounded-xl transition-all duration-300',
                        entries.length > 0 ? 'bg-primary/15 dark:bg-primary-500/20 text-primary dark:text-primary-400' : 'bg-primary dark:bg-primary-900 text-white'
                    ]">
                        <UIcon v-if="entries.length > 0" name="i-ph-check-bold" class="size-5" />
                        <span v-else>3</span>
                    </div>
                    <div>
                        <div class="font-semibold">Date Range</div>
                        <div class="text-muted text-sm">Set up the date range of the time entries</div>
                    </div>
                </div>
                <div class="text-sm text-primary">
                    Selected User: {{ selectedUser.name }} ({{ selectedUser.email }})
                </div>
                <!-- <div class="mt-2 flex flex-wrap gap-3 items-center">
                        <label>Start Date:</label>
                        <input v-model="startDate" type="date" class="border p-1 rounded" />
                        <label>End Date:</label>
                        <input v-model="endDate" type="date" class="border p-1 rounded" />
                        <button @click="fetchTimeEntries" class="bg-blue-500 text-white px-3 py-1 rounded">Fetch Time
                            Entries</button>
                    </div> -->
                <div class="flex items-end gap-2">

                    <UFormField label="Date Range:" size="lg">
                        <UFieldGroup>
                            <UInputDate ref="inputDate" v-model="dateRange" range size="lg"
                                separator-icon="i-lucide-arrow-right">
                                <template #trailing>
                                    <UPopover :reference="inputDate?.inputsRef?.[0]?.$el">
                                        <UButton color="neutral" variant="link" size="sm" icon="i-lucide-calendar"
                                            aria-label="Select a date range" class="px-0" />
                                        <template #content>
                                            <div class="flex items-stretch divide-x divide-(--ui-border)">
                                                <div class="hidden sm:flex flex-col justify-center py-2">
                                                    <UButton v-for="(range, index) in ranges" :key="index"
                                                        :label="range.label" color="neutral" variant="ghost"
                                                        class="rounded-none px-4"
                                                        :class="[isRangeSelected(range) ? 'bg-elevated' : 'hover:bg-elevated/50']"
                                                        truncate @click="selectRange(range)" />
                                                </div>

                                                <UCalendar v-model="dateRange" class="p-2"
                                                    :number-of-months="isDesktop ? 2 : 1" range />
                                            </div>
                                        </template>
                                    </UPopover>
                                </template>
                            </UInputDate>
                            <UButton label="Fetch Time Entries" icon="i-lucide-download" variant="soft" size="lg"
                                @click="fetchTimeEntries" />
                        </UFieldGroup>
                    </UFormField>
                </div>
                <div class="text-sm text-primary">{{ timeFeedback }}</div>
            </UCard>

            <!-- <USeparator v-if="entries.length > 0" /> -->

            <!-- 4. Time Entries Preview -->
            <UCard v-if="entries.length > 0" variant="soft" :ui="{ body: 'flex flex-col gap-4' }">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div :class="[
                            'flex items-center justify-center font-semibold w-10 h-10 rounded-xl transition-all duration-300',
                            entries.length > 0 ? 'bg-primary/15 dark:bg-primary-500/20 text-primary dark:text-primary-400' : 'bg-primary dark:bg-primary-900 text-white'
                        ]">
                            <UIcon v-if="entries.length > 0" name="i-ph-check-bold" class="size-5" />
                            <span v-else>4</span>
                        </div>
                        <div>
                            <div class="font-semibold">Time Entries</div>
                            <div class="text-muted text-sm">Preview of time entries based on the set date range</div>
                        </div>
                    </div>

                    <UFormField label="Excel Theme:" size="sm"
                        :ui="{ root: 'flex items-center gap-2', container: 'mt-0' }">
                        <USelectMenu v-model="selectedTheme" :items="availableThemes" size="sm" class="w-48">
                            <template #leading>
                                <div class="size-2 rounded-full" :class="selectedTheme?.color" />
                            </template>
                        </USelectMenu>
                    </UFormField>
                </div>

                <!-- Add Entry -->
                <UCard variant="soft">
                    <div class="flex items-center gap-2 mb-2">
                        <UIcon name="i-lucide-pencil-line" class="size-4 shrink-0" />
                        <span class="font-semibold text-sm">Add New Entry</span>
                    </div>
                    <div class="flex items-end gap-6">
                        <UFormField label="Date:" size="lg"
                            :ui="{ root: 'flex items-center gap-2', container: 'mt-0' }">
                            <UInputDate ref="entryDateInput" v-model="entryDate" size="lg">
                                <template #trailing>
                                    <UPopover :reference="entryDateInput?.inputsRef?.[0]?.$el">
                                        <UButton color="neutral" variant="link" size="sm" icon="i-lucide-calendar"
                                            aria-label="Select a date" class="px-0" />
                                        <template #content>
                                            <UCalendar v-model="entryDate" class="p-2" />
                                        </template>
                                    </UPopover>
                                </template>
                            </UInputDate>
                        </UFormField>
                        <UFormField label="Description:" size="lg"
                            :ui="{ root: 'flex items-center gap-2 w-full', container: 'mt-0 w-full' }">
                            <UInput v-model="newEntry.desc" placeholder="Enter description" class="w-full" />
                        </UFormField>
                        <UFormField label="Times:" size="lg"
                            :ui="{ root: 'flex items-center gap-2', container: 'mt-0' }">
                            <UInputTime v-model="entryTimes" range separator-icon="i-lucide-arrow-right" />
                        </UFormField>
                        <UButton label="Add" icon="i-lucide-plus" size="lg" variant="soft" @click="addEntry" />
                    </div>
                </UCard>

                <!-- Table -->
                <UCard :ui="{ body: 'p-0 sm:p-0 overflow-x-auto' }">
                    <div v-html="previewHtml" class="text-sm"></div>
                </UCard>
            </UCard>

            <!-- <USeparator v-if="entries.length > 0" /> -->

            <!-- 5. Export -->

            <UCard v-if="entries.length > 0" variant="soft" :ui="{ body: 'flex flex-col gap-4' }">
                <div class="flex items-center gap-3">
                    <div :class="[
                        'flex items-center justify-center font-semibold w-10 h-10 rounded-xl transition-all duration-300',
                        isExported ? 'bg-primary/15 dark:bg-primary-500/20 text-primary dark:text-primary-400' : 'bg-primary dark:bg-primary-900 text-white'
                    ]">
                        <UIcon v-if="isExported" name="i-ph-check-bold" class="size-5" />
                        <span v-else>5</span>
                    </div>
                    <div>
                        <div class="font-semibold">Export</div>
                        <div class="text-muted text-sm">Export displayed data</div>
                    </div>
                </div>
                <div class="flex items-end gap-2">
                    <UFormField label="Export File Name:" size="lg"
                        :ui="{ root: 'flex items-center gap-2 w-full', container: 'mt-0 w-full', label: 'whitespace-nowrap' }">
                        <UInput v-model="exportFileName" class="w-full" />
                    </UFormField>

                    <UButton label="Export to Excel" icon="i-lucide-file-spreadsheet" size="lg" color="primary"
                        @click="exportExcel" />
                </div>
            </UCard>
        </div>
    </UPage>

    <UDrawer v-model:open="isDrawerOpen" direction="right" inset title="Application Logs"
        description="View real-time application events and status." :ui="{ container: 'sm:py-6 sm:pr-8' }">
        <template #header>
            <div class="flex items-center justify-between w-full">
                <div>
                    <div class="text-lg font-semibold">Application Logs</div>
                    <div class="text-sm text-muted-foreground">View real-time application events and status.</div>
                </div>
                <UButton label="Clear" icon="i-lucide-trash-2" color="error" variant="soft" size="sm"
                    @click="logger.clearLogs" :disabled="!logger.logs.value.length" />
            </div>
        </template>
        <template #body>
            <div v-if="logger.logs.value.length" class="relative pl-8 space-y-6">
                <!-- Vertical Timeline Line -->
                <div class="absolute left-4 top-2 bottom-2 w-0.5 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>

                <div v-for="log in logger.logs.value" :key="log.id" class="relative">
                    <!-- Timeline Dot -->
                    <div class="absolute -left-[19px] top-1/2 -translate-y-1/2 size-2 rounded-full ring-5 ring-white dark:ring-neutral-900 z-10 shadow-sm"
                        :class="[
                            log.level === 'error' ? 'bg-error' :
                                log.level === 'warn' ? 'bg-warning' :
                                    'bg-primary'
                        ]">
                    </div>

                    <!-- Log Card -->
                    <div
                        class="flex flex-col gap-2 text-sm bg-neutral-100/50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all hover:border-primary/30 dark:hover:border-primary/30 group">
                        <div class="flex items-center gap-2">
                            <UIcon
                                :name="log.level === 'error' ? 'i-lucide-alert-circle' : log.level === 'warn' ? 'i-lucide-alert-triangle' : 'i-lucide-info'"
                                :class="[log.level === 'error' ? 'text-error' : log.level === 'warn' ? 'text-warning' : 'text-primary', 'size-4 transition-transform group-hover:scale-110']" />
                            <span class="font-bold uppercase text-[10px] tracking-widest"
                                :class="[log.level === 'error' ? 'text-error' : log.level === 'warn' ? 'text-warning' : 'text-primary']">
                                {{ log.level }}
                            </span>
                            <span
                                class="text-[10px] font-medium text-muted-foreground ml-auto bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">
                                {{ new Date(log.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit', minute: '2-digit',
                                    second: '2-digit'
                                }) }}
                            </span>
                        </div>
                        <span class="text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                            {{ log.message }}
                        </span>
                    </div>
                </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-24 text-center">
                <div
                    class="size-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                    <UIcon name="i-lucide-scroll-text" class="size-8 text-muted-foreground/50" />
                </div>
                <h3 class="font-semibold text-neutral-900 dark:text-neutral-100">No events logged</h3>
                <p class="text-sm text-muted-foreground mt-1 px-8">Activity from your current session will appear here.
                </p>
            </div>
        </template>
    </UDrawer>
</template>