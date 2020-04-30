
function verifyValidInput(stringInput) {
    let reg = /[0-9]|-|\+|\/|\*|\(|\)|\\/;
    return Boolean(stringInput.match(reg));
}

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
        else {
            if (startInd != -1) {
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
    evaluateParanthesis(input);
    evaluatePowers(input);
    evaluateMultiplication(input);
    evaluateOperation(input,"/",(num1, num2) => num1/num2);
    evaluateOperation(input,"+",(num1, num2) => num1+num2);
    return input;
}


function handleInput(inputString) {
    const input = Array.from(inputString).filter((char) => char != " ");
    parseNumbers(input);
    evaluateExpression(input);
    const result = input[0];
    console.log(result);
}

let inputString = "21 + 52 + (2 + 3 * 6)**2 / 3";
handleInput(inputString);
