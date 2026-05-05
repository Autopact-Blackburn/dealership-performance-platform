import { supabase } from '../shared/api.js'
import { parseDelimitedText } from './csv-parser.js'

const importButtons = document.querySelectorAll('.import-btn')

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

    // =========================================
    // CREATE IMPORT BATCH
    // =========================================

    const { data: batchData, error: batchError } =
      await supabase
        .from('raw_import_batches')
        .insert({
          import_type: importType,
          source_filename: `${importType}_${Date.now()}.txt`,
          row_count: rows.length
        })
        .select()
        .single()

    if (batchError) {

      console.error(batchError)

      showResult(
        `${importType} batch creation failed.`,
        'error'
      )

      return

    }

    // =========================================
    // BUILD RAW ROW OBJECTS
    // =========================================

    const payload = rows.map((row, index) => {

      const rowObject = {}

      headers.forEach((header, headerIndex) => {

        rowObject[header] = row[headerIndex]

      })

      return {
        batch_id: batchData.id,
        import_type: importType,
        row_number: index + 1,
        row_data: rowObject
      }

    })

    // =========================================
    // INSERT RAW ROWS
    // =========================================

    const { error: rowInsertError } =
      await supabase
        .from('raw_import_rows')
        .insert(payload)

    if (rowInsertError) {

      console.error(rowInsertError)

      showResult(
        `${importType} row import failed.`,
        'error'
      )

      return

    }

    totalRowsImported += rows.length
    completedImports += 1

    updateOverviewCards()

    showResult(
      `${importType} imported successfully. ${rows.length} rows processed.`
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