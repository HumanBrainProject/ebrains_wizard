import React from 'react';
import Form from '@rjsf/core';
//import Form from '@rjsf/antd';
import TableField from "react-jsonschema-form-extras/lib/table";
import RichTextWidget, {CustomArrayField} from '../../../components/customWidgets';

import {uiSchema} from '../../../helpers/uiSchemaProvider';
import validator from "@rjsf/validator-ajv8";

import {transformErrors} from '../../../helpers/ErrorTransformer';
import CascadeSelector from '../../../components/CascadeSelector';


const ExperimentWizard = React.memo(({ schema, formData,  onSubmit, onChange, goBack }) => {

  const handleOnChange = ( {formData} ) => onChange(formData);
  const handleOnSubmit = ( {formData} ) => onSubmit(formData);

  return (
    <Form widgets={{richtext: RichTextWidget}} fields={CustomArrayField} schema={schema} uiSchema={uiSchema} formData={formData} transformErrors={transformErrors} showErrorList={false} omitExtraData={true} onSubmit={handleOnSubmit} onChange={handleOnChange} validator={validator}>
      <div className="footer">
        <div className="col-xs-5 back-panel">
          <button type="submit" className="btn btn-info btn-default" onClick={goBack}>Previous Page</button>
        </div>
        <div className="col-xs-5 col-xs-offset-2 submit-panel">
          <button type="submit" className="btn btn-info btn-primary">Submit Metadata</button></div>
      </div>
    </Form>
  );
});

export default ExperimentWizard;