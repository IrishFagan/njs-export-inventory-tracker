import React, { useState, useEffect} from 'react';
import { Route, Routes } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import ComponentList from './components/ComponentList';
import DateSelector from './components/DateSelector';
import Header from './components/Header';
import Home from './components/Home';

export default function App() {
  return(
    <div className="font-mono font-medium">
      <Header/>
      <Routes>
        <Route path="/" element={ <Home /> } />
      </Routes>
    </div>
  );
}