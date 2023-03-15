import React, {useState} from 'react';
import { Popover, Steps } from 'antd';
import ConfigProvider from './ConfigProvider';

// Todo: import these from external file (also do this in Wizard.js)
//const WIZARD_STEPS_LIST = [ WIZARD_STEP_GENERAL, WIZARD_STEP_DATASET, WIZARD_STEP_FUNDING, WIZARD_STEP_CONTRIBUTORS, WIZARD_STEP_EXPERIMENT ];
const WIZARD_STEP_NAMES = [ "Introduction", "Dataset part 1", "Dataset part 2", "Funding", "Contributors", "Experiments" ];
const NUM_STEPS = WIZARD_STEP_NAMES.length;

const customDot = (dot, { status, index }) => {

  // Update status message
  switch (status) {
    case 'process':
      status = 'In progress';
      break;
    case 'finish':
      status = 'Completed';
      break;
    case 'wait':
      status = 'Incomplete';
      break;
    default:
      status = 'Incomplete';
  }

  return (
    <Popover
      content={
        <span>
          Step {index+1} of {NUM_STEPS} - Status: {status}
        </span>
      }
    >
      {dot}
    </Popover>
  );
};
//const description = 'Incomplete';

const ProgressBar = ({step, status, onChanged}) => {
//const ProgressBar = ({step, status, onChanged}) => {

  const [, setCurrent] = useState(0);
  
  const onChange = (value) => {
    setCurrent(value);
    onChanged(value);
  };

  let items = [];

  for (let i = 0; i < NUM_STEPS; i++) {
      
      let thisDescription = 'Incomplete';
      let thisStatus = 'wait';
      
      if ( status[i] ) {
        thisDescription = 'Completed';
        thisStatus = 'finish';
      } else if ( i===step ) {
        thisStatus = 'process';
      } else {
        thisStatus = 'wait';
      }

      if  ( i === step ) {
        thisStatus = 'process';
        thisDescription = 'In progress';
      }

      let thisItem = {
          title: WIZARD_STEP_NAMES[i],
          description: thisDescription,
          status: thisStatus,
      };
      items.push(thisItem);
  }

  return (

  <ConfigProvider>
     <div style={{"marginBottom":"30px"}}>
      <Steps
          current={step}
          //status={status[step]}
          onChange={onChange}
          progressDot={customDot}
          items={items}
      />
    </div>
  </ConfigProvider>
  );
};
export default ProgressBar;
