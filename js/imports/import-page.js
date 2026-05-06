import { parseDelimitedText } from './csv-parser.js'
import { buildStoredRowRecords } from './import-calculators.js'
import { persistRawImport } from './raw-import-service.js'

const importButtons = document.querySelectorAll('.import-btn')

function getPeriodIdForImport() {

  const el = document.querySelector('#normalizationPeriodId')

  return el && el.value.trim()
    ? el.value.trim()
    : null

}

let totalRowsImported = 0
let completedImports = 0

function updateOverviewCards() {

  document.querySelector('#rowsImported').textContent =
    totalRowsImported.toLocaleString()

  document.querySelector('#importsCompleted').textContent =
    `${completedImports} / 7`

}

function showResult(message, type = 'success') {

  const results = document.querySelector('#importResults')

  const card = document.createElement('div')

  card.className = 'result-card'

  card.style.marginBottom = '12px'

  card.style.borderLeft =
    type === 'error'
      ? '6px solid #dc2626'
      : '6px solid #16a34a'

  card.innerHTML = `
    <strong>${type === 'error' ? 'Error' : 'Success'}</strong>
    <br>
    ${message}
  `

  results.prepend(card)

}

async function processImport(importType, rawText) {

  try {

    if (!rawText.trim()) {

      showResult(
        `${importType} import is empty.`,
        'error'
      )

      return

    }

    const parsed = parseDelimitedText(rawText)

    const headers = parsed.headers
    const rows = parsed.rows

    console.log('HEADERS:', headers)
    console.log('ROWS:', rows)

    if (!rows.length) {

      showResult(
        `${importType} contains no rows.`,
        'error'
      )

      return

    }

    const rowRecords = buildStoredRowRecords(importType, headers, rows)

    const result = await persistRawImport(importType, rowRecords, {
      periodId: getPeriodIdForImport()
    })

    if (!result.ok) {

      console.error(result.error)

      showResult(
        `${result.error?.message || importType} import failed.`,
        'error'
      )

      return

    }

    totalRowsImported += result.rowCount
    completedImports += 1

    updateOverviewCards()

    showResult(
      `${importType} imported successfully. ${result.rowCount} rows processed.`
    )

    console.log(
      `${importType} import complete`
    )

  } catch (error) {

    console.error(error)

    showResult(
      `${importType} unexpected failure.`,
      'error'
    )

  }

}

importButtons.forEach(button => {

  button.addEventListener('click', async () => {

    const importType = button.dataset.type

    let textareaId = ''

    switch (importType) {

      case 'signups':
        textareaId = 'signupsInput'
        break

      case 'deal_log':
        textareaId = 'dealLogInput'
        break

      case 'accessories':
        textareaId = 'accessoriesInput'
        break

      case 'finance':
        textareaId = 'financeInput'
        break

      case 'aftercare':
        textareaId = 'aftercareInput'
        break

      case 'leads':
        textareaId = 'leadsInput'
        break

      case 'reviews':
        textareaId = 'reviewsInput'
        break

    }

    const textarea =
      document.querySelector(`#${textareaId}`)

    await processImport(
      importType,
      textarea.value
    )

  })

})

updateOverviewCards()