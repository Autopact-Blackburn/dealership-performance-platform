import { supabase } from '../shared/api.js';

/**
 * Persist raw import batches and rows. All Supabase table access for imports lives here.
 */
export async function persistRawImport(importType, rowRecords, options = {}) {
  const periodId = options.periodId ?? null;
  const sourceFilename =
    options.sourceFilename ?? `${importType}_${Date.now()}.txt`;

  const batchInsert = {
    import_type: importType,
    source_filename: sourceFilename,
    row_count: rowRecords.length
  };

  if (periodId) {
    batchInsert.period_id = periodId;
  }

  const { data: batchData, error: batchError } = await supabase
    .from('raw_import_batches')
    .insert(batchInsert)
    .select()
    .single();

  if (batchError) {
    return { ok: false, error: batchError };
  }

  const payload = rowRecords.map((row_data, index) => {
    const row = {
      batch_id: batchData.id,
      import_type: importType,
      row_number: index + 1,
      row_data
    };
    if (periodId) {
      row.period_id = periodId;
    }
    return row;
  });

  const { error: rowInsertError } = await supabase
    .from('raw_import_rows')
    .insert(payload);

  if (rowInsertError) {
    return { ok: false, error: rowInsertError };
  }

  return {
    ok: true,
    batchId: batchData.id,
    rowCount: rowRecords.length
  };
}
