"use strict";
var TokenType;
(function (TokenType) {
    TokenType[TokenType["Dot"] = 0] = "Dot";
    TokenType[TokenType["Begin"] = 1] = "Begin";
    TokenType[TokenType["End"] = 2] = "End";
    TokenType[TokenType["Variable"] = 3] = "Variable";
    TokenType[TokenType["Number"] = 4] = "Number";
    TokenType[TokenType["Operator"] = 5] = "Operator";
    TokenType[TokenType["ParenthesisOpen"] = 6] = "ParenthesisOpen";
    TokenType[TokenType["ParenthesisClose"] = 7] = "ParenthesisClose";
    TokenType[TokenType["Asingment"] = 8] = "Asingment";
    TokenType[TokenType["Semicolon"] = 9] = "Semicolon";
    TokenType[TokenType["EOL"] = 10] = "EOL";
})(TokenType || (TokenType = {}));
class Token {
    constructor(aType, aValue) {
        this.type = aType;
        this.value = aValue;
    }
}
class ExpressionsCompiler {
    constructor() {
        this.pos = 0;
        this.text = "";
        this.operators = ["+", "-", "/", "*"];
        this.importance = new Map([
            ["+", 1],
            ["-", 1],
            ["*", 2],
            ["/", 2]
        ]);
        this.pos = 1;
        this.text = "";
        this.currentChar = undefined;
        this.currentToken = undefined;
    }
    nextToken() {
        while (this.currentChar !== undefined) {
            if (this.currentChar.trim().length === 0) {
                this.skip();
                continue;
            }
            if (this.currentChar === "(") {
                let char = this.currentChar;
                this.forward();
                return new Token(TokenType.ParenthesisOpen, char);
            }
            if (this.currentChar === ")") {
                let char = this.currentChar;
                this.forward();
                return new Token(TokenType.ParenthesisClose, char);
            }
            // проверка isdigit - переводим в число и проверяем перевелось ли
            if (!isNaN(+this.currentChar)) {
                // console.log(`char is ${this.currentChar}`);
                return new Token(TokenType.Number, this.number());
            }
            // console.log(`CHECKING operator ${this.currentChar} is ${this.operators.includes(this.currentChar)}`);
            if (this.operators.includes(this.currentChar)) {
                let char = this.currentChar;
                this.forward();
                return new Token(TokenType.Operator, char);
            }
            throw SyntaxError(`Unexpected character: ${this.currentChar}`);
        }
        return new Token(TokenType.EOL, "");
    }
    skip() {
        while (this.currentChar !== undefined && this.currentChar.trim().length === 0)
            this.forward();
    }
    forward() {
        this.pos += 1;
        if (this.pos > this.text.length - 1)
            this.currentChar = undefined;
        else
            this.currentChar = this.text.charAt(this.pos);
    }
    number() {
        let result = "";
        while (this.currentChar !== undefined && !isNaN(+this.currentChar)) {
            result += this.currentChar;
            this.forward();
        }
        return result;
    }
    parseExpression(curImportance = 0) {
        let left = this.parsePrimary();
        while (this.currentToken !== undefined && this.currentToken.type === TokenType.Operator) {
            let operator = this.currentToken.value;
            let operatorImportance = this.importance.get(operator);
            if (operatorImportance < curImportance)
                break;
            this.currentToken = this.nextToken();
            let right = this.parseExpression(operatorImportance + 1);
            switch (operator) {
                case "+":
                    left += right;
                    break;
                case "-":
                    left -= right;
                    break;
                case "*":
                    left *= right;
                    break;
                case "/":
                    if (right === 0)
                        throw Error("Zero division");
                    left = Math.trunc(left / right);
                    break;
            }
        }
        return left;
    }
    parsePrimary() {
        let isNegative = false;
        if (this.currentToken.type === TokenType.Operator && this.currentToken.value === "-") {
            isNegative = true;
            this.currentToken = this.nextToken();
            if (this.currentToken === undefined || this.currentToken.type === TokenType.Operator) {
                throw Error("Unexpected end of expression after minus");
            }
        }
        let result;
        if (this.currentToken.type === TokenType.Number) {
            result = +this.currentToken.value;
            this.currentToken = this.nextToken();
        }
        else if (this.currentToken.type == TokenType.ParenthesisOpen) {
            this.currentToken = this.nextToken();
            result = this.parseExpression();
            if (this.currentToken === undefined || this.currentToken.type !== TokenType.ParenthesisClose) {
                throw Error("( is not closed");
            }
            this.currentToken = this.nextToken();
        }
        else {
            throw Error(`Unexpected token: ${this.currentToken.value}`);
        }
        if (isNegative)
            result = -result;
        return result;
    }
    expr() {
        this.currentToken = this.nextToken();
        return this.parseExpression();
    }
    eval(expression) {
        this.text = expression;
        this.pos = 0;
        this.currentChar = this.text[this.pos];
        this.currentToken = undefined;
        return this.expr();
    }
}
;
class PascalCompiler {
    constructor() {
        this.variables = new Map();
        this.pos = 0;
        this.text = "";
        this.operators = ["+", "-", "/", "*"];
        this.expressionCompiler = new ExpressionsCompiler();
    }
    nextToken() {
        while (this.pos < this.text.length &&
            (this.text[this.pos] === " " || this.text[this.pos] === "\n" || this.text[this.pos] === "\r" || this.text[this.pos] === "\t")) {
            this.pos += 1;
        }
        if (this.pos > this.text.length - 1) {
            return new Token(TokenType.EOL, "");
        }
        let currentChar = this.text[this.pos];
        if (currentChar === "B") {
            let substr = this.text.substring(this.pos, this.pos + 5);
            if (substr === "BEGIN") {
                this.pos += 5;
                return new Token(TokenType.Begin, "BEGIN");
            }
        }
        if (currentChar === "E") {
            let substr = this.text.substring(this.pos, this.pos + 3);
            if (substr === "END") {
                this.pos += 3;
                return new Token(TokenType.End, "END");
            }
        }
        if (/[a-zA-Z_]/.test(currentChar)) {
            let identifier = "";
            while (this.pos < this.text.length && /[a-zA-Z0-9_]/.test(this.text[this.pos])) {
                identifier += this.text[this.pos];
                this.pos += 1;
            }
            return new Token(TokenType.Variable, identifier);
        }
        if (!isNaN(+currentChar)) {
            let number = "";
            while (this.pos < this.text.length && !isNaN(+this.text[this.pos])) {
                number += this.text[this.pos];
                this.pos += 1;
            }
            return new Token(TokenType.Number, number);
        }
        if (currentChar === ":") {
            this.pos += 1;
            while (this.pos < this.text.length && this.text[this.pos].trim() === "")
                this.pos += 1;
            if (this.text[this.pos] === "=") {
                this.pos += 1;
                return new Token(TokenType.Asingment, ":=");
            }
        }
        if (this.operators.includes(currentChar)) {
            this.pos += 1;
            return new Token(TokenType.Operator, currentChar);
        }
        if (currentChar === "(") {
            this.pos += 1;
            return new Token(TokenType.Operator, "(");
        }
        if (currentChar === ")") {
            this.pos += 1;
            return new Token(TokenType.Operator, ")");
        }
        if (currentChar === ";") {
            this.pos += 1;
            return new Token(TokenType.Semicolon, ";");
        }
        if (currentChar === ".") {
            this.pos += 1;
            return new Token(TokenType.Dot, ".");
        }
        throw new Error(`Unexpected character: ${currentChar}`);
    }
    getExpressionFromPascal(line) {
        let expr = line.trim();
        expr = expr.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (match) => {
            if (this.variables.has(match)) {
                return this.variables.get(match).toString();
            }
            else {
                throw new Error(`Undefined variable: ${match}`);
            }
        });
        return expr;
    }
    parseBlock() {
        let token = this.nextToken();
        if (token.type !== TokenType.Begin) {
            throw new Error("Expected BEGIN");
        }
        token = this.nextToken();
        while (token.type !== TokenType.End) {
            if (token.type === TokenType.Variable) {
                const varName = token.value;
                token = this.nextToken();
                if (token.type !== TokenType.Asingment) {
                    throw new Error(`Expected := after ${varName}`);
                }
                let expressionStr = "";
                token = this.nextToken();
                while (token.type !== TokenType.Semicolon &&
                    token.type !== TokenType.End &&
                    token.type !== TokenType.EOL) {
                    expressionStr += token.value + " ";
                    token = this.nextToken();
                }
                expressionStr = expressionStr.trim();
                const value = this.expressionCompiler.eval(this.getExpressionFromPascal(expressionStr));
                this.variables.set(varName, value);
                if (token.type === TokenType.Semicolon) {
                    token = this.nextToken();
                }
            }
            else if (token.type === TokenType.Begin) {
                this.pos -= 5;
                this.parseBlock();
                token = this.nextToken();
            }
            else {
                throw new Error(`Unexpected token: ${token.value}`);
            }
        }
        token = this.nextToken();
    }
    compile(program) {
        this.text = program;
        this.pos = 0;
        this.variables.clear();
        this.parseBlock();
        return this.variables;
    }
    run(program) {
        return this.compile(program);
    }
}
