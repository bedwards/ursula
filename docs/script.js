class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    toggleSign() {
        if (this.currentOperand === '0' || this.currentOperand === '') return;
        if (this.currentOperand.includes('-')) {
            this.currentOperand = this.currentOperand.replace('-', '');
        } else {
            this.currentOperand = '-' + this.currentOperand;
        }
    }

    percentage() {
        if (this.currentOperand === '') return;
        const current = parseFloat(this.currentOperand);
        this.currentOperand = (current / 100).toString();
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '' && operation === '-') {
            this.appendNumber('-');
            return;
        }
        if (this.currentOperand === '' && this.previousOperand !== '') {
            this.operation = operation;
            return;
        }
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    computation = "Error";
                } else {
                    computation = prev / current;
                }
                break;
            default:
                return;
        }
        
        if (computation !== "Error") {
            // Fix floating point errors
            computation = Math.round(computation * 10000000000) / 10000000000;
        }
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    getDisplayNumber(number) {
        if (number === "Error") return number;
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            if (stringNumber === '-') {
                integerDisplay = '-';
            } else {
                integerDisplay = '';
            }
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        
        // Adjust font size based on length
        const length = this.currentOperand.length;
        if (length > 12) {
            this.currentOperandTextElement.style.fontSize = '1.8rem';
        } else if (length > 9) {
            this.currentOperandTextElement.style.fontSize = '2.5rem';
        } else {
            this.currentOperandTextElement.style.fontSize = '3.5rem';
        }

        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
        
        // Update AC to C if we have current operand
        const clearBtn = document.querySelector('[data-action="clear"]');
        if (this.currentOperand !== '0' || this.previousOperand !== '') {
            clearBtn.innerText = 'C';
        } else {
            clearBtn.innerText = 'AC';
        }
    }
}

const numberButtons = document.querySelectorAll('[data-action="number"], [data-action="decimal"]');
const operationButtons = document.querySelectorAll('[data-action="operator"]');
const equalsButton = document.querySelector('[data-action="calculate"]');
const clearButton = document.querySelector('[data-action="clear"]');
const toggleSignButton = document.querySelector('[data-action="toggle-sign"]');
const percentageButton = document.querySelector('[data-action="percentage"]');
const previousOperandTextElement = document.getElementById('previous-operand');
const currentOperandTextElement = document.getElementById('current-operand');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.value);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.value);
        calculator.updateDisplay();
    });
});

equalsButton.addEventListener('click', button => {
    calculator.compute();
    calculator.updateDisplay();
});

clearButton.addEventListener('click', button => {
    if (clearButton.innerText === 'C') {
        calculator.currentOperand = '0';
        clearButton.innerText = 'AC';
        calculator.updateDisplay();
    } else {
        calculator.clear();
        calculator.updateDisplay();
    }
});

toggleSignButton.addEventListener('click', button => {
    calculator.toggleSign();
    calculator.updateDisplay();
});

percentageButton.addEventListener('click', button => {
    calculator.percentage();
    calculator.updateDisplay();
});

// Keyboard support
document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault();
        calculator.compute();
        calculator.updateDisplay();
    }
    if (e.key === 'Backspace') {
        if (calculator.currentOperand.length > 1) {
            calculator.currentOperand = calculator.currentOperand.slice(0, -1);
        } else {
            calculator.currentOperand = '0';
        }
        calculator.updateDisplay();
    }
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        let op = e.key;
        if (op === '*') op = '×';
        if (op === '/') op = '÷';
        calculator.chooseOperation(op);
        calculator.updateDisplay();
    }
});