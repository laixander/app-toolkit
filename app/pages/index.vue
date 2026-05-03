<template>
    <UPage title="Clockify Exporter" description="Export Clockify time entries to Excel">
        <div class="space-y-6">

            <!-- 1. API Key & Workspace -->
            <UCard variant="soft" :ui="{ body: 'flex flex-col gap-4' }">
                <div class="flex items-center gap-3">
                    <div :class="[
                        'flex items-center justify-center font-semibold w-10 h-10 rounded-xl transition-all duration-300',
                        selectedWorkspace ? 'bg-success/15 dark:bg-success-500/20 text-success dark:text-success-400' : 'bg-success dark:bg-success-900 text-white'
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
                    <div class="text-sm text-success">{{ feedback }}</div>
                </div>
            </UCard>

            <!-- <USeparator v-if="selectedWorkspace" /> -->

            <!-- 2. Search User -->
            <UCard v-if="selectedWorkspace" variant="soft" :ui="{ body: 'flex flex-col gap-4' }">
                <div class="flex items-center gap-3">
                    <div :class="[
                        'flex items-center justify-center font-semibold w-10 h-10 rounded-xl transition-all duration-300',
                        selectedUser ? 'bg-success/15 dark:bg-success-500/20 text-success dark:text-success-400' : 'bg-success dark:bg-success-900 text-white'
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
                        entries.length > 0 ? 'bg-success/15 dark:bg-success-500/20 text-success dark:text-success-400' : 'bg-success dark:bg-success-900 text-white'
                    ]">
                        <UIcon v-if="entries.length > 0" name="i-ph-check-bold" class="size-5" />
                        <span v-else>3</span>
                    </div>
                    <div>
                        <div class="font-semibold">Date Range</div>
                        <div class="text-muted text-sm">Set up the date range of the time entries</div>
                    </div>
                </div>
                <div class="text-sm text-success">
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
                <div class="text-sm text-success">{{ timeFeedback }}</div>
            </UCard>

            <!-- <USeparator v-if="entries.length > 0" /> -->

            <!-- 4. Time Entries Preview -->
            <UCard v-if="entries.length > 0" variant="soft" :ui="{ body: 'flex flex-col gap-4' }">
                <div class="flex items-center gap-3">
                    <div :class="[
                        'flex items-center justify-center font-semibold w-10 h-10 rounded-xl transition-all duration-300',
                        entries.length > 0 ? 'bg-success/15 dark:bg-success-500/20 text-success dark:text-success-400' : 'bg-success dark:bg-success-900 text-white'
                    ]">
                        <UIcon v-if="entries.length > 0" name="i-ph-check-bold" class="size-5" />
                        <span v-else>4</span>
                    </div>
                    <div>
                        <div class="font-semibold">Time Entries</div>
                        <div class="text-muted text-sm">Preview of time entries based on the set date range</div>
                    </div>
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
                        <UButton label="Add" icon="i-lucide-plus" size="lg" color="success" @click="addEntry" />
                    </div>
                </UCard>

                <!-- Table -->
                <UCard :ui="{ body: 'p-0 sm:p-0' }">
                    <div v-html="previewHtml" class="dark:text-gray-900 dark:bg-white text-sm"></div>
                </UCard>
            </UCard>

            <USeparator v-if="entries.length > 0" />

            <!-- 5. Export -->
            <section class="space-y-4" v-if="entries.length > 0">
                <div class="flex items-center gap-3">
                    <div
                        class="bg-success dark:bg-success-900 flex items-center justify-center font-semibold text-white w-10 h-10 rounded-xl">
                        5</div>
                    <div>
                        <div class="font-semibold">Export</div>
                        <div class="text-muted text-sm">Export displayed data</div>
                    </div>
                </div>
                <div class="flex items-end gap-2">
                    <UFormField label="Export File Name:" size="lg"
                        :ui="{ root: 'flex items-center gap-2 w-full', container: 'mt-0 w-full', label: 'whitespace-nowrap' }">
                        <UInput v-model="exportFileName" variant="soft" class="w-full" />
                    </UFormField>
                    <UButton label="Export to Excel" icon="i-lucide-file-spreadsheet" size="lg" color="success"
                        @click="exportExcel" />
                </div>
            </section>
        </div>
    </UPage>

    <UDrawer v-model:open="isDrawerOpen" direction="right" inset title="Application Logs"
        description="View real-time application events and status." :ui="{ container: 'sm:py-6 sm:pr-8' }">
        <template #body>
            <div class="space-y-4">
                <div class="flex items-center gap-2 text-sm text-muted-foreground bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    v-for="i in 3" :key="i">
                    <UIcon name="i-lucide-info" class="size-4" />
                    <span>System event {{ i }}: Application initialized successfully.</span>
                </div>
            </div>
        </template>
    </UDrawer>
</template>
<script setup lang="ts">
definePageMeta({
    title: 'Clockify Exporter',
    headerActionLabel: 'History',
    headerActionIcon: 'i-lucide-history'
})

const events = useEvents()
const isDrawerOpen = ref(false)
events.on('viewLogs', () => {
    isDrawerOpen.value = true
})

import { ref, computed, watch, shallowRef, useTemplateRef } from 'vue'
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
    } catch (err: any) {
        console.error('Error fetching users', err)
        feedback.value = err.message || 'Error fetching users.'
    } finally {
        loadingUsers.value = false
    }
}

function selectUser(user: ClockifyUser) {
    selectedUser.value = user
}


/* 3. Time Entries */
async function fetchTimeEntries() {
    if (!selectedWorkspace.value || !selectedUser.value) return alert('Select workspace & user')
    if (!startDate.value || !endDate.value) return alert('Select both dates')

    timeFeedback.value = 'Loading...'
    try {
        const startISO = new Date(startDate.value + 'T00:00:00Z').toISOString()
        const endISO = new Date(endDate.value + 'T23:59:59Z').toISOString()
        const res = await fetch(
            `https://api.clockify.me/api/v1/workspaces/${selectedWorkspace.value.id}/user/${selectedUser.value.id}/time-entries?start=${startISO}&end=${endISO}&page-size=100`,
            { headers: { 'X-Api-Key': apiKey.value } }
        )
        if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`)
        entries.value = await res.json()
        timeFeedback.value = 'Time entries fetched successfully!'
    } catch (err: any) {
        console.error(err)
        timeFeedback.value = err.message || 'Error fetching entries.'
    }
}

/* 4. Add Entry */
function addEntry() {
    if (!entryDate.value || !newEntry.value.desc) return alert('Fill in all fields')
    const dateStr = entryDate.value.toString()
    const startISO = new Date(`${dateStr}T${entryTimes.value.start.toString()}:00`).toISOString()
    const endISO = new Date(`${dateStr}T${entryTimes.value.end.toString()}:00`).toISOString()
    entries.value.push({
        description: newEntry.value.desc,
        timeInterval: { start: startISO, end: endISO }
    })
    newEntry.value = {
        desc: ''
    }
    entryDate.value = null
    entryTimes.value = {
        start: new Time(9, 0),
        end: new Time(17, 0)
    }
}

/* Grouping & Table Preview */
function groupAndFormatEntries() {
    const grouped: Record<string, TimeEntry[]> = {}

    // Group entries by date
    for (const e of entries.value) {
        const start = e.timeInterval?.start
        if (!start) continue

        const key = start.slice(0, 10)
        if (!grouped[key]) grouped[key] = [] // ✅ ensures array is initialized
        grouped[key].push(e)
    }

    const rows: {
        date: string
        desc: string
        start: string
        end: string
        total: string
    }[] = []

    // Iterate through grouped entries
    for (const dateKey of Object.keys(grouped).sort()) {
        const dayEntries = grouped[dateKey] ?? [] // ✅ safe fallback
        let total = 0

        for (const e of dayEntries) {
            const start = new Date(e.timeInterval.start)
            const end = new Date(e.timeInterval.end)
            const dur = (end.getTime() - start.getTime()) / 1000
            total += dur

            rows.push({
                date: start.toLocaleDateString(),
                desc: e.description,
                start: start.toLocaleTimeString(),
                end: end.toLocaleTimeString(),
                total: secondsToDuration(dur)
            })
        }

        rows.push({
            date: '',
            desc: `Total for ${new Date(dateKey).toLocaleDateString()}`,
            start: '',
            end: '',
            total: secondsToDuration(total)
        })
    }

    return rows
}

const previewHtml = computed(() => {
    const rows = groupAndFormatEntries()
    if (rows.length === 0) return '<p>No entries.</p>'
    let html = `
    <table border="1" style="border-collapse:collapse;width:100%;text-align:center;">
      <tr><th colspan="5" style="background:#E2EFDA; padding:6px">Weekly Accomplishment Report</th></tr>
      <tr><th colspan="5" style="background:#E2EFDA; padding:6px">Period covered: ${startDate.value || 'N/A'} - ${endDate.value || 'N/A'}</th></tr>
      <tr style="background:#E2EFDA;">
        <th style="padding:6px">Date Entered</th><th style="padding:6px">Description</th><th style="padding:6px">Start Time</th><th style="padding:6px">End Time</th><th style="padding:6px">Total Time</th>
      </tr>`
    for (const r of rows) {
        const bg = r.desc.includes('Total for') ? ' style="background:#E2EFDA;"' : ''
        html += `<tr${bg}><td style="padding:6px">${r.date}</td><td style="padding:6px">${r.desc}</td><td style="padding:6px">${r.start}</td><td style="padding:6px">${r.end}</td><td style="padding:6px">${r.total}</td></tr>`
    }
    html += '</table>'
    return html
})

/* 5. Export Excel */
async function exportExcel() {
    const data = groupAndFormatEntries()
    if (data.length === 0) return alert('No entries to export')

    const workbook = new ExcelJS.Workbook()
    const ws = workbook.addWorksheet('TimeEntries')

    ws.columns = [
        { key: 'date', width: 16.88 },
        { key: 'desc', width: 53.13 },
        { key: 'start', width: 14.38 },
        { key: 'end', width: 14.38 },
        { key: 'total', width: 14.38 }
    ]

    const titleRow = ws.addRow(['Weekly Accomplishment Report'])
    ws.mergeCells('A1:E1')
    titleRow.eachCell((c) => {
        c.font = { bold: true, size: 14 }
        c.alignment = { horizontal: 'center' }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
    })

    const periodRow = ws.addRow([`Period covered: ${startDate.value || 'N/A'} - ${endDate.value || 'N/A'}`])
    ws.mergeCells('A2:E2')
    periodRow.eachCell((c) => {
        c.font = { bold: true, size: 12 }
        c.alignment = { horizontal: 'center' }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
    })

    ws.addRow(['Date Entered', 'Description', 'Start Time', 'End Time', 'Total Time'])
        .eachCell((c) => {
            c.font = { bold: true }
            c.alignment = { horizontal: 'center' }
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
        })

    for (const r of data) ws.addRow([r.date, r.desc, r.start, r.end, r.total])

    ws.eachRow({ includeEmpty: false }, (row, n) => {
        if (n >= 4 && row.getCell(2).value?.toString().includes('Total for')) {
            row.eachCell((c) => {
                c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
            })
        }
    })

    const buf = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${exportFileName.value}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
}

/* Auto-update export file name */
watch(startDate, (v) => {
    if (v)
        exportFileName.value = `Accomplishment Report (${new Date(v).toLocaleDateString()} Week#) - Last Name, First Name`
})
</script>