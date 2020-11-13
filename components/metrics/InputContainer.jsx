import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Label = styled.label`
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  border-radius: 5px 0 0 5px;
  border: 1px solid #d8d8d8;
  border-right: 0;
  background-color: white;
  cursor: text;
  flex-grow: 1;
  margin: 0;

  input {
    -webkit-appearance: none;
    border: none;
    outline: 0;
    padding: 0;
    font-size: 1rem;
    padding: 0 0.5rem;
    font-family: inherit;
  }
`;

const Button = styled.button`
  height: 2.5rem;
  display: inline-block;
  cursor: pointer;
  user-select: none;
  background-color: #f03009;
  text-align: center;
  text-transform: uppercase;
  outline: 0;
  border: 1px solid #f03009;
  letter-spacing: 0.15rem;
  padding: 0 1rem;
  border-radius: 0 5px 5px 0;
  color: white;
  transition: background ease-in 0.25s;
  flex-grow: 1;
  margin: 0;

  &:hover {
    background-color: #bd0000;
    border-color: #bd0000;
  }
`;

const Form = styled.form`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media screen and (max-width: 640px) {
    flex-direction: column;
  }
  margin-bottom: 1rem;

  width: 100%;
  padding: 0 2rem;
`;

const HourContainer = styled.form`
  border: 1px solid #d8d8d8;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;

  margin: 0 0 0 1rem;

  @media screen and (max-width: 640px) {
    margin: 1rem 0 0 0;
  }

  label {
    cursor: pointer;
    height: 2.5rem;

    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;

    font-size: 1rem;
    font-family: inherit;
    user-select: none;
  }

  label:not(:last-of-type) {
    border-right: 1px solid #d8d8d8;
  }

  input {
    display: none;
  }

  input:checked + label {
    background-color: #f03009;
    color: white;
  }
`;

const EventContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.align};
  @media screen and (max-width: 640px) {
    align-items: center;
  }
`;

export default function InputContainer({ ws, hours, setHours }) {
  const [message, setMessage] = useState("");

  function submit(e) {
    e.preventDefault();
    ws.send(JSON.stringify({ type: "message", message }));
    setMessage("");
  }

  return (
    <Container>
      <EventContainer align="center">
        <h2>Send an event!</h2>
        <Form onSubmit={submit}>
          <Label key="a">
            <input
              key="b"
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
            ></input>
          </Label>
          <Button>Send</Button>
        </Form>
      </EventContainer>
      <EventContainer align="center" key={hours}>
        <h2>Time</h2>
        <HourContainer>
          {[12, 24, 48].map(v => (
            <React.Fragment key={v}>
              <input
                type="radio"
                id={`${v}`}
                value={v}
                checked={hours === v}
                onChange={e => setHours(parseInt(e.target.value))}
              ></input>
              <label key={v} checked={hours === v} htmlFor={`${v}`}>
                {v}h
              </label>
            </React.Fragment>
          ))}
        </HourContainer>
      </EventContainer>
    </Container>
  );
}
