import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Wizard from './modules/Wizard/Main';
import Tracker from './modules/Tracker/Main';

import PrivacyBanner from './components/PrivacyBanner';
import DropdownMenu from './components/DropdownMenu';

import './App.css';

const App = () => {

  // This is a workaround to force the Wizard component to re-render 
  // when the user selects a new action from the dropdown menu: Someone who
  // knows React should fix this.
  const [selectedAction, setSelectedAction] = useState(undefined);
  const [updateKey, setUpdateKey] = useState(Date.now());

  function handleMenuSelection(selectedOption) {
    if (!!selectedOption) {
      setSelectedAction(selectedOption);
      setUpdateKey(Date.now());
    }
  }

  return(
    <div className="App">
      
      <header className="app-header">
        <div className="container container-header">
          <a href="/"><img src="EBRAINS-Curation-Services.png" alt="EBRAINS Curation Services Logo" width="100%" style={{"margin":"10px","display":"block","marginLeft":"auto","marginRight":"auto"}} /></a>
        </div>
      </header>
      <div className="container-gradient"></div>

      <BrowserRouter>
        <Routes>
          <Route path="/tracker" element={
            <div className="container container-form">
              <Tracker /> 
            </div> 
          } />
          
          <Route path="/" element={ 
            <div>
              <div className="container-subheader">
                <div className="content-container">
                  <div className="privacy-notice">
                    <PrivacyBanner />
                  </div>
                  <div className="subheader-menu">
                    <DropdownMenu handleMenuSelection={handleMenuSelection}/>
                  </div>
                </div>
              </div>
              <div style={{marginTop:"20px", marginBottom:"20px"}}>
              </div>
              <div className="container container-form">
                <Wizard action={selectedAction} updateKey={updateKey}/>
              </div>
            </div>
            } />
        </Routes>
      </BrowserRouter>

      <footer className="app-footer footer">
        <div className="container-footer">
          <div className="pull-left">
            <p className="text-muted">Copyright © {new Date().getFullYear()} EBRAINS. All rights reserved.</p>
          </div>
          <div className="pull-right">
            <p className="text-muted"> 
              <a href="https://github.com/HumanBrainProject/ebrains_wizard/issues/new" target="_blank" rel="noreferrer">Report issue (Github)</a> 
              &nbsp;|&nbsp;
              <a href="mailto:curation-support@ebrains.eu?subject=Metadata Wizard Issue : <Enter short description here>&body=Dear Curation Team,%0D%0A%0D%0A%0D%0A">Report issue (Email)</a> 
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
};

export default App;
