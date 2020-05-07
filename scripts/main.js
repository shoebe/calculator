/*
 * Calculator functions
 */
function verifyValidInput(stringInput) {
    //needs more work
    let reg = /[0-9]|-|\+|\/|\*|\(|\)|\\/;
    return Boolean(stringInput.match(reg));
}

const FUNC = {
    "sin": (number) => Math.sin(number),
    "cos": (number) => Math.cos(number),
    "tan": (number) => Math.tan(number),
    "asin": (number) => Math.asin(number),
    "acos": (number) => Math.acos(number),
    "atan": (number) => Math.atan(number),
    "log": (number) => Math.log10(number),
    "ln": (number) => Math.log(number),
}
Object.freeze(FUNC)


function parseNumbers(input){
    //add a non-number to force a check at end of array
    input.push("z");
    const isPartNum = /[0-9]|\./;
    let startInd = -1;
    for (let i = 0; i < input.length; i++) {
        if (input[i].match(isPartNum) || input[i]=="-"&&startInd==-1) {
            if (startInd == -1) {
                startInd = i;
            } 
        }
        else if (startInd != -1) {
            const snippet = input.slice(startInd, i).join("");
            const number = parseFloat(snippet);
            input.splice(startInd,snippet.length,number);
            // in case of normal substraction, add "+"
            if (snippet[0] == "-" && typeof(input[startInd-1]) == "number"){
                input.splice(startInd,0,"+");
                startInd += 1;
            }
            //reset i location because array changed length
            i = startInd;
            startInd = -1;
        }
        else if (input[i] == "π") input[i] = Math.PI;

        for(let func of Object.keys(FUNC)){
            const snippet = input.slice(i,i+func.length)
            if (snippet.join("") == func){
                input.splice(i,func.length,func);
            }
        }
    }
    //pop added non-number
    input.pop();
    return input;
}

function evaluateParanthesis(input){
    let openParaInd = -1;
    let count = 0;
    for (let i = 0; i < input.length; i++){
        if (input[i] == "(") {
            count += 1;
            openParaInd = openParaInd == -1 ? i : openParaInd;
        }
        else if (input[i] == ")") {
            count -= 1;
            if (count == 0) {
                const snippet = input.slice(openParaInd+1, i);
                input.splice(openParaInd, snippet.length+2, ...evaluateExpression(snippet));
                //reset i location because array changed length
                i = openParaInd;
                openParaInd = -1;
            }
        }
    }
    return input
}


function evaluateFunctions(input) {
    for (let i = 0; i < input.length; i++) {
        const func = FUNC[input[i]];
        if (func){
            const num = func(input[i+1]);
            input.splice(i,2,num);
        }
    }
    return input;
}

function evaluatePowers(input){
    // check for two '*' in a row
    let last=false;
    for (let i = 0; i < input.length; i++) {
        if (input[i] == "*") {
            if (last) {
                const evaluated = Math.pow(input[i-2], input[i+1]);
                input.splice(i-2,4,evaluated);
                i -= 2;
                last = false;
                continue;
            }
            last = true;
        } else {
            last = false;
        }
    }
    return input;
}

function evaluateMultiplication(input) {
    for (let i = 0; i < input.length; i++) {
        if (input[i] == "*"){
            // case of power
            if (input[i+1] == "*") {
                i += 1;
            } else {
                const evaluated = input[i-1] * input[i+1];
                input.splice(i-1,3,evaluated);
                i--;
            }
        }
    }
    return input;
}

//evaluates divisions and additions
function evaluateOperation(input,operation, func) {
    for (let i = 0; i < input.length; i++) {
        if (input[i] == operation){
            const evaluated = func(input[i-1], input[i+1]);
            input.splice(i-1,3,evaluated);
            i--;
        }
    }
    return input;
}


function evaluateExpression(input) {
    console.log(input);
    evaluateParanthesis(input);
    evaluateFunctions(input);
    evaluatePowers(input);
    evaluateMultiplication(input);
    evaluateOperation(input,"/",(num1, num2) => num1/num2);
    evaluateOperation(input,"+",(num1, num2) => num1+num2);
    return input;
}


function calculate(inputString) {
    const input = Array.from(inputString).filter((char) => char != " ");
    parseNumbers(input);
    evaluateExpression(input);
    const result = input[0];
    console.log(result);
    return result;
}

/*
 * Calculator functions end
 */


function buttonOnClick() {
    IOscreen.value += this.value;
}

function evaluate() {
    IOscreen.value = calculate(IOscreen.value);
    const element = document.createElement("input");
    element.type = "button";
    element.value = IOscreen.value;
    element.onclick = buttonOnClick;
    historyNode.insertBefore(element, historyNode.firstChild);
    
}

const IOscreen = document.querySelector("#io-screen")

const basicOperations = ["+", "-", "*", "/", "**", "(", ")", "π"];
const numPad = ["←", "0", ".", "1", "2", "3", "4", "5", "6", "7", "8", "9"].reverse();
const importantFunctions = {"C": () => IOscreen.value = "",
                            "=" : () => evaluate()}

const basicOpNode = document.querySelector("#basic-operations");
const numPadNode = document.querySelector("#numpad");
const importantFuncNode = document.querySelector("#important-functions");

for (let op of basicOperations){
    const child = document.createElement("input");
    child.type = "button";
    child.value = op;
    child.onclick = buttonOnClick;
    basicOpNode.appendChild(child);
}

for (let char of numPad) {
    const child = document.createElement("input");
    child.type = "button";
    child.value = char;
    child.onclick = buttonOnClick;
    numPadNode.appendChild(child);
}
//erase button
numPadNode.lastChild.onclick = () => IOscreen.value = IOscreen.value.slice(0,-1);
//evaluate on enter key press
document.onkeypress = (event) => {
    let char = event.which || event.keyCode;
    if (char == 13) {evaluate()}
};

for (let val of Object.keys(importantFunctions)) {
    const child = document.createElement("input");
    child.type = "button";
    child.value = val;
    child.onclick = importantFunctions[val];
    importantFuncNode.appendChild(child);
}

//History
const historyNode = document.querySelector("#history");
const historyToggler = document.querySelector("#history-button");
historyToggler.onclick = () => {
    historyToggler.style.transform = historyToggler.style.transform == "translate(-5vmin, 50%) rotate(180deg)" ? "translate(-5vmin, 50%)" : "translate(-5vmin, 50%) rotate(180deg)";
    historyNode.style.display = historyNode.style.display == "flex" ? "none" : "flex";
};