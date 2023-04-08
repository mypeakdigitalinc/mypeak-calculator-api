const port = process.env.PORT || 8080
const express = require('express')
const server = express()
server.get('/',(req,res) => {
    res.json('Welcome to MyPEAK Calculator')
})
server.get('/financial/payment-calculator', (req,res) => {
    const args = {
        loanAmount: req.query.loanAmount,
        interestRate: req.query.interestRate,
        amortizationInYears: req.query.amortizationInYears,
        termType: req.query.termType
    }
    const result = calculatePayments(args)
    res.json(result)
})

server.post('/financial/payment-calculator',express.json({type: '*/*'}), (req,res) => {
    const args = {
        loanAmount: req.body.loanAmount,
        interestRate: req.body.interestRate,
        amortizationInYears: req.body.amortizationInYears,
        termType: req.body.termType
    }
    const result = calculatePayments(args)
    res.json(result)
})


server.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})

const calculatePayments = (args) => {
    const loanAmount = Number(args.loanAmount)
    const interestRate = Number(args.interestRate)
    const amortizationInYears = Number(args.amortizationInYears)
    //0 = Monthly, 1 = Semi-Monthly, 2 = Bi-Weekly
    const termType = Number(args.termType)
    var totalTerms = 0
    if(termType === 1){
        totalTerms = amortizationInYears * 24
    } else if(termType === 2){
        totalTerms = amortizationInYears * 26
    } else {
        totalTerms = amortizationInYears * 12
    }
    var payment = 0
    var rate = 0
    var factor = 0
    if(totalTerms > 0){
        if(interestRate != 0){
            rate = ((interestRate / 12 ) / 100);
            factor = (rate + (rate / (Math.pow(rate + 1, totalTerms) - 1)));
            payment = (loanAmount * factor);
        } else {
            payment = (loanAmount / totalTerms)
        }
    }
    const schedules = []
    var currentPrincipal = loanAmount
    for(let i=1; i<=totalTerms; i++){
        const schedule = {
            beginning_balance: currentPrincipal.toFixed(2), 
            interest_payment: (currentPrincipal * rate).toFixed(2),
            principal_payment: (payment - (currentPrincipal * rate)).toFixed(2),
            ending_balance: (currentPrincipal - (payment - (currentPrincipal * rate))).toFixed(2)
        }
        currentPrincipal = currentPrincipal - (payment - (currentPrincipal * rate))
        schedules.push(schedule)
    }
    payment = payment.toFixed(2)
    const result = {
        loan_amount: loanAmount,
        term_type: termType,
        interest_rate: interestRate,
        number_of_payments: totalTerms,
        payment : payment,
        total_payments : (payment * totalTerms).toFixed(2),
        total_interest: ((payment * totalTerms) - loanAmount).toFixed(2),
        schedules: schedules
    }
    return result
}