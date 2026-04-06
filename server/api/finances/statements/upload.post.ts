import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'No form data received' })
  }

  // Extract fields from multipart
  const fileField = formData.find(f => f.name === 'file')
  const accountIdField = formData.find(f => f.name === 'accountId')

  if (!fileField || !fileField.data || !fileField.filename) {
    throw createError({ statusCode: 400, statusMessage: 'PDF file is required' })
  }
  if (!accountIdField || !accountIdField.data) {
    throw createError({ statusCode: 400, statusMessage: 'accountId is required' })
  }

  const accountId = parseInt(accountIdField.data.toString())
  if (isNaN(accountId)) {
    throw createError({ statusCode: 400, statusMessage: 'accountId must be a number' })
  }

  const user = event.context.user

  // Verify account exists
  const accountResult = await db.query(
    'SELECT * FROM finance_accounts WHERE id = $1 AND user_id = $2',
    [accountId, user.id],
  )
  if (accountResult.rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  }
  const account = accountResult.rows[0]

  // Save PDF to disk
  const dir = join(process.cwd(), 'data', 'finances')
  await mkdir(dir, { recursive: true })

  const fileName = `${accountId}_${Date.now()}_${fileField.filename}`
  const filePath = join(dir, fileName)
  await writeFile(filePath, fileField.data)

  // Extract text from PDF
  let pdfText: string
  try {
    pdfText = await extractTextFromPdf(fileField.data)
  } catch (err: any) {
    throw createError({ statusCode: 400, statusMessage: `Failed to extract text from PDF: ${err.message}` })
  }

  if (!pdfText.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'PDF appears to be empty or contains no extractable text' })
  }

  // Create statement record
  const stmtResult = await db.query(
    `INSERT INTO finance_statements (account_id, file_name, file_path, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING *`,
    [accountId, fileField.filename, filePath],
  )
  const statementId = stmtResult.rows[0].id

  // Start background processing
  const runId = await runFinanceIngest(
    statementId,
    accountId,
    account.institution,
    account.type,
    pdfText,
  )

  setResponseStatus(event, 202)
  return {
    statementId,
    runId,
    status: 'processing',
  }
})
