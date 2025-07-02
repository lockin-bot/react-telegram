/// <reference types="@react-telegram/core" />
import React, { useState } from "react";
import { MtcuteAdapter } from "@react-telegram/mtcute-adapter";


interface CalculatorState {
  display: string;
  previousValue: string;
  operator: string | null;
  waitingForOperand: boolean;
}

const initialState: CalculatorState = {
  display: "0",
  previousValue: "0",
  operator: null,
  waitingForOperand: false,
};

const Calculator = () => {
  const [state, setState] = useState<CalculatorState>(initialState);

  const inputNumber = (num: string) => {
    if (state.waitingForOperand) {
      setState({
        ...state,
        display: num,
        waitingForOperand: false,
      });
    } else {
      setState({
        ...state,
        display: state.display === "0" ? num : state.display + num,
      });
    }
  };

  const inputDecimal = () => {
    if (state.waitingForOperand) {
      setState({
        ...state,
        display: "0.",
        waitingForOperand: false,
      });
    } else if (state.display.indexOf(".") === -1) {
      setState({
        ...state,
        display: state.display + ".",
      });
    }
  };

  const clear = () => {
    setState(initialState);
  };

  const performOperation = (nextOperator: string | null) => {
    const inputValue = parseFloat(state.display);

    if (state.previousValue === "0") {
      setState({
        ...state,
        previousValue: String(inputValue),
        operator: nextOperator,
        waitingForOperand: true,
      });
    } else if (state.operator) {
      const previousValue = parseFloat(state.previousValue);
      let newValue = previousValue;

      if (state.operator === "+") {
        newValue = previousValue + inputValue;
      } else if (state.operator === "-") {
        newValue = previousValue - inputValue;
      } else if (state.operator === "*") {
        newValue = previousValue * inputValue;
      } else if (state.operator === "/") {
        newValue = inputValue !== 0 ? previousValue / inputValue : 0;
      }

      const display = String(newValue);

      setState({
        display,
        previousValue: nextOperator ? display : "0",
        operator: nextOperator,
        waitingForOperand: true,
      });
    }
  };

  const calculate = () => {
    performOperation(null);
  };

  const renderButton = (label: string, onClick: () => void, wide: boolean = false) => (
    <button onClick={onClick}>
      {label}
    </button>
  );

  return (
    <>
      <b>🧮 Calculator</b>
      <br />
      <br />
      <code>{state.display}</code>
      <br />
      <br />
      <row>
        {renderButton("C", clear)}
        {renderButton("±", () => setState({ ...state, display: String(-parseFloat(state.display)) }))}
        {renderButton("%", () => setState({ ...state, display: String(parseFloat(state.display) / 100) }))}
        {renderButton("÷", () => performOperation("/"))}
      </row>
      <row>
        {renderButton("7", () => inputNumber("7"))}
        {renderButton("8", () => inputNumber("8"))}
        {renderButton("9", () => inputNumber("9"))}
        {renderButton("×", () => performOperation("*"))}
      </row>
      <row>
        {renderButton("4", () => inputNumber("4"))}
        {renderButton("5", () => inputNumber("5"))}
        {renderButton("6", () => inputNumber("6"))}
        {renderButton("−", () => performOperation("-"))}
      </row>
      <row>
        {renderButton("1", () => inputNumber("1"))}
        {renderButton("2", () => inputNumber("2"))}
        {renderButton("3", () => inputNumber("3"))}
        {renderButton("+", () => performOperation("+"))}
      </row>
      <row>
        {renderButton("0", () => inputNumber("0"), true)}
        {renderButton(".", inputDecimal)}
        {renderButton("=", calculate)}
      </row>
    </>
  );
};

// Main bot setup
async function main() {
  // You'll need to set these environment variables
  const config = {
    apiId: parseInt(process.env.API_ID || '0'),
    apiHash: process.env.API_HASH || '',
    botToken: process.env.BOT_TOKEN || '',
    storage: process.env.STORAGE_PATH || '.mtcute'
  };
  
  if (!config.apiId || !config.apiHash || !config.botToken) {
    console.error('Please set API_ID, API_HASH, and BOT_TOKEN environment variables');
    process.exit(1);
  }
  
  const adapter = new MtcuteAdapter(config);
  
  // Set up command handlers
  adapter.onCommand('start', () => <Calculator />);
  adapter.onCommand('calculator', () => <Calculator />);
  adapter.onCommand('calc', () => <Calculator />);
  
  // Start the bot
  await adapter.start(config.botToken);
  
  console.log('Calculator bot is running! Send /calculator to begin.');
}

// Run the bot
main().catch(console.error);