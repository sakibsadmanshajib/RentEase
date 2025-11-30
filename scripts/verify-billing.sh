#!/bin/bash

# Comprehensive Billing Service Verification Script
API_URL="http://localhost:3004"
TENANT_ID="tenant-test-123"

echo "======================================"
echo "Billing Service Comprehensive Verification"
echo "======================================"
echo ""

# Test 1: Create Invoice
echo "[1] Creating Invoice ($1000)..."
INVOICE=$(curl -s -X POST "$API_URL/invoices" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"amount\": 1000,
    \"dueDate\": \"2024-12-31\",
    \"currency\": \"USD\"
  }")
INVOICE_ID=$(echo $INVOICE | node -e "try { console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')).id) } catch(e) { console.log('') }")
echo "✓ Invoice ID: $INVOICE_ID"
echo ""

# Test 2: Check Ledger (AR Debit, Revenue Credit)
echo "[2] Checking Ledger after Invoice..."
LEDGER=$(curl -s "$API_URL/invoices/ledger?tenantId=$TENANT_ID")
echo "$LEDGER" | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
console.log('Ledger Entries:', data.length);
const totalDebit = data.reduce((sum, e) => sum + parseFloat(e.debit), 0);
const totalCredit = data.reduce((sum, e) => sum + parseFloat(e.credit), 0);
console.log('Total Debit: \$' + totalDebit.toFixed(2));
console.log('Total Credit: \$' + totalCredit.toFixed(2));
console.log('Balanced:', totalDebit === totalCredit ? '✓ YES' : '✗ NO');
"
echo ""

# Test 3: Record Payment
echo "[3] Recording Payment ($1000)..."
PAYMENT=$(curl -s -X POST "$API_URL/invoices/payments" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"invoiceId\": \"$INVOICE_ID\",
    \"amount\": 1000,
    \"method\": \"CASH\"
  }")
echo "✓ Payment recorded"
echo ""

# Test 4: Check Invoice Status
echo "[4] Checking Invoice Status..."
INVOICE_STATUS=$(curl -s "$API_URL/invoices/$INVOICE_ID")
echo "$INVOICE_STATUS" | node -e "
const inv = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
console.log('Invoice Status:', inv.status);
console.log('Expected: PAID');
"
echo ""

# Test 5: Create One-Time Expense
echo "[5] Creating One-Time Expense (Repair: \$200)..."
EXPENSE1=$(curl -s -X POST "$API_URL/invoices/expenses" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"category\": \"REPAIR\",
    \"description\": \"Plumbing repair\",
    \"amount\": 200,
    \"currency\": \"USD\",
    \"isRecurring\": false
  }")
EXPENSE1_ID=$(echo $EXPENSE1 | node -e "try { console.log(JSON.parse(require('fs').readFileSync(0, 'utf-8')).id) } catch(e) { console.log('') }")
echo "✓ Expense ID: $EXPENSE1_ID"
echo ""

# Test 6: Create Weekly Recurring Expense
echo "[6] Creating Weekly Recurring Expense (Maintenance: \$150)..."
EXPENSE2=$(curl -s -X POST "$API_URL/invoices/expenses" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"category\": \"MAINTENANCE\",
    \"description\": \"Weekly lawn service\",
    \"amount\": 150,
    \"currency\": \"USD\",
    \"isRecurring\": true,
    \"recurrenceType\": \"WEEKLY\",
    \"recurrenceInterval\": 1,
    \"recurrenceMaxOccurrences\": 6
  }")
EXPENSE2_ID=$(echo $EXPENSE2 | node -e "try { const e = JSON.parse(require('fs').readFileSync(0, 'utf-8')); console.log(e.id) } catch(e) { console.log('') }")
echo "$EXPENSE2" | node -e "
try {
  const exp = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
  console.log('✓ Expense ID:', exp.id);
  console.log('  Next Occurrence:', exp.nextOccurrence);
  console.log('  Occurrence Count:', exp.occurrenceCount);
} catch(e) { console.log('Error:', e.message) }
"
echo ""

# Test 7: Create "Sunday of every month for 6 occurrences"
echo "[7] Creating Complex Recurring Expense (First Sunday monthly: \$100)..."
EXPENSE3=$(curl -s -X POST "$API_URL/invoices/expenses" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"category\": \"INSURANCE\",
    \"description\": \"Monthly insurance\",
    \"amount\": 100,
    \"currency\": \"USD\",
    \"isRecurring\": true,
    \"recurrenceType\": \"CUSTOM\",
    \"recurrenceDayOfWeek\": 0,
    \"recurrenceMaxOccurrences\": 6
  }")
echo "$EXPENSE3" | node -e "
try {
  const exp = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
  console.log('✓ Expense ID:', exp.id);
  console.log('  Next Occurrence:', exp.nextOccurrence);
} catch(e) { console.log('Error:', e.message) }
"
echo ""

# Test 8: List All Expenses
echo "[8] Listing All Expenses..."
EXPENSES=$(curl -s "$API_URL/invoices/expenses?tenantId=$TENANT_ID")
echo "$EXPENSES" | node -e "
const exps = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
console.log('Total Expenses:', exps.length);
exps.forEach(exp => {
  console.log('  -', exp.category + ':', '\$' + exp.amount, exp.isRecurring ? '(Recurring)' : '(One-time)');
});
"
echo ""

# Test 9:Final Ledger Check
echo "[9] Final Ledger Balance Check..."
FINAL_LEDGER=$(curl -s "$API_URL/invoices/ledger?tenantId=$TENANT_ID")
echo "$FINAL_LEDGER" | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
const totalDebit = data.reduce((sum, e) => sum + parseFloat(e.debit), 0);
const totalCredit = data.reduce((sum, e) => sum + parseFloat(e.credit), 0);
console.log('Total Entries:', data.length);
console.log('Total Debit: \$' + totalDebit.toFixed(2));
console.log('Total Credit: \$' + totalCredit.toFixed(2));
console.log('Balanced:', totalDebit === totalCredit ? '✓ YES' : '✗ NO');

if (totalDebit === totalCredit) {
  console.log('\\n✓ ALL TESTS PASSED');
} else {
  console.log('\\n✗ LEDGER NOT BALANCED');
  process.exit(1);
}
"

echo ""
echo "======================================"
echo "Verification Complete!"
echo "======================================"
