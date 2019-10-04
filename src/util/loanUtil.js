'use strict';

function loanApproved(income, amount, loanToIncomeRatio) {
    if(amount < 5000 || amount > 50000 || amount > income * loanToIncomeRatio) {
        return false;
    }

    return true;
}

module.exports = {
    loanApproved
};