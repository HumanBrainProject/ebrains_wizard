import React from 'react';

import GeneralWizard from './Wizard/GeneralWizard';
import DatasetWizard from './Wizard/DatasetWizard';
import FundingAndAffiliationWizard from './Wizard/FundingAndAffiliationWizard';
import ContributorsWizard from './Wizard/ContributorsWizard';
import ExperimentWizard from './Wizard/ExperimentWizard.js';
//import SubjectGroupWizard from './Wizard/SubjectGroupWizard';
//import SubjectTemplateWizard from './Wizard/SubjectTemplateWizard';
//import SubjectsWizard from './Wizard/SubjectsWizard';
//import TissueSampleCollectionWizard from './Wizard/TissueSampleCollectionWizard';
//import TissueSampleTemplateWizard from './Wizard/TissueSampleTemplateWizard';
//import TissueSamplesWizard from './Wizard/TissueSamplesWizard';
import Result from './Result';

import { 
  generateDocumentsFromDataset, 
}  from '../helpers/Translator';

import {
  generalSchema,
  datasetSchema,
  experimentSchema,
  areSubjectsGrouped,
  areTissueSamplesGrouped,
  getStudyTopic,
  uiSchema
} from '../helpers/Wizard';

import * as fundingAndAffiliationModule from '../schemas/fundingAndAffiliation.json';
import * as contributorsModule from '../schemas/contributors.json';

const fundingAndAffiliationSchema = fundingAndAffiliationModule.default;
const contributorsSchema = contributorsModule.default;

const STUDY_TOPIC_SUBJECT_VALUE = "Subject";
const STUDY_TOPIC_TISSUE_SAMPLE_VALUE = "Tissue sample";
const STUDY_TOPIC_ARTIFICIAL_TISSUE_SAMPLE_VALUE = "Artificial tissue sample";

const WIZARD_STEP_GENERAL = "WIZARD_STEP_GENERAL";
const WIZARD_STEP_DATASET = "WIZARD_STEP_DATASET";
const WIZARD_STEP_FUNDING_AND_AFFILIATION = "WIZARD_STEP_FUNDING_AND_AFFILIATION";
const WIZARD_STEP_CONTRIBUTORS = "WIZARD_STEP_CONTRIBUTORS";
const WIZARD_STEP_EXPERIMENT = "WIZARD_STEP_EXPERIMENT";
const WIZARD_STEP_SUBJECT_GROUP = "WIZARD_STEP_SUBJECT_GROUP";
const WIZARD_STEP_SUBJECT_TEMPLATE = "WIZARD_STEP_SUBJECT_TEMPLATE";
const WIZARD_STEP_SUBJECTS = "WIZARD_STEP_SUBJECTS";
const WIZARD_STEP_TISSUE_SAMPLE_GROUP = "WIZARD_STEP_TISSUE_SAMPLE_GROUP";
const WIZARD_STEP_TISSUE_SAMPLE_TEMPLATE = "WIZARD_STEP_TISSUE_SAMPLE_TEMPLATE";
const WIZARD_STEP_TISSUE_SAMPLES = "WIZARD_STEP_TISSUE_SAMPLES";
const WIZARD_END = "WIZARD_END";
class Wizard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      datasetinfo: undefined,
      general: undefined,
      fundingAndAffiliation: undefined,
      contributors: undefined,
      experiment: undefined,
      subjectGroups: undefined,
      subjectTemplate: undefined,
      subjects: [],
      tissueSampleCollections: undefined,
      tissueSampleTemplate: undefined,
      tissueSamples: [],
      wizardStep: WIZARD_STEP_GENERAL,
      schema: generalSchema,
      uiSchema: uiSchema,
      result: undefined
    }
  }

  handleGeneralSubmit = data => {
    this.setState({
      general: data,
      wizardStep: WIZARD_STEP_DATASET,
      schema: datasetSchema
    });
  };

  handleDatasetSubmit = data => {
    this.setState({
      datasetinfo: data,
      wizardStep: WIZARD_STEP_FUNDING_AND_AFFILIATION,
      schema: fundingAndAffiliationSchema
    });
  };


  handleFundingAndAffiliationSubmit = data => {
    this.setState({
      fundingAndAffiliation: data,
      wizardStep: WIZARD_STEP_CONTRIBUTORS,
      schema: contributorsSchema
    });
  }

  handleContributorsSubmit = data => {
    this.setState({
      contributors: data,
      wizardStep: WIZARD_STEP_EXPERIMENT,
      schema: experimentSchema
    });
  }

  handleExperimentSubmit = data => {

    const dataset = {...this.state.general, ...this.state.datasetinfo, ...this.state.fundingAndAffiliation, ...this.state.contributors, ...data};
    const res = generateDocumentsFromDataset(dataset);

    this.setState(prevState => ({
      dataset: {...prevState.general, ...prevState.datasetinfo, ...prevState.fundingAndAffiliation, ...prevState.contributors, ...data}, 
      experiment: data,
      result: res,
      wizardStep: WIZARD_END
    }));
  }

  goBackToGeneralWizard = () => {
    this.setState({
      schema: generalSchema,
      wizardStep: WIZARD_STEP_GENERAL
    });
  }

  goBackToDatasetWizard = () => {
    this.setState({
      schema: datasetSchema,
      wizardStep: WIZARD_STEP_DATASET
    });
  }

  goBackTofundingAndAffiliation = () => {
    this.setState({
      schema: fundingAndAffiliationSchema,
      wizardStep: WIZARD_STEP_FUNDING_AND_AFFILIATION
    });
  };

  goBackTocontributors = () => {
    this.setState({
      schema: contributorsSchema,
      wizardStep: WIZARD_STEP_CONTRIBUTORS
    });
  }

  goBackToExperiment = () => {
    this.setState({
      schema: experimentSchema,
      wizardStep: WIZARD_STEP_EXPERIMENT
    });
  }

  handleGoBackToPreviousStepWizard = () => {
    const dataset = this.state.dataset;
    const studyTopic = getStudyTopic(dataset);
    switch (this.state.wizardStep) {
      case WIZARD_STEP_SUBJECT_GROUP:
      case WIZARD_STEP_SUBJECT_TEMPLATE:
        this.goBackToExperiment();
        break;
      case WIZARD_STEP_DATASET:
        this.goBackToGeneralWizard();
        break;
      case WIZARD_STEP_FUNDING_AND_AFFILIATION:
        this.goBackToDatasetWizard();
        break;
      case WIZARD_STEP_CONTRIBUTORS:
        this.goBackTofundingAndAffiliation();
        break;
      case WIZARD_STEP_EXPERIMENT:
        this.goBackTocontributors();
        break;
      case WIZARD_STEP_TISSUE_SAMPLE_GROUP:
      case WIZARD_STEP_TISSUE_SAMPLE_TEMPLATE:
        if (studyTopic === STUDY_TOPIC_TISSUE_SAMPLE_VALUE) {
          this.goBackToSubjectGroupsWizard();
        } else { // if (studyTopic === STUDY_TOPIC_ARTIFICIAL_TISSUE_SAMPLE_VALUE)
          this.goBackToExperiment();
        }
        break;
      case WIZARD_STEP_SUBJECTS:
        this.goBackToSubjectTemplateWizard();
        break;
      case WIZARD_STEP_TISSUE_SAMPLES:
        this.goBackToTissueSampleTemplateWizard();
        break;
      case WIZARD_END:
        if (studyTopic === STUDY_TOPIC_SUBJECT_VALUE) {
          if (areSubjectsGrouped(dataset)) {
            this.goBackToSubjectGroupsWizard();
          } else {
            this.goBackToSubjectsWizard();
          }
        } else if (studyTopic === STUDY_TOPIC_TISSUE_SAMPLE_VALUE || studyTopic === STUDY_TOPIC_ARTIFICIAL_TISSUE_SAMPLE_VALUE) {
          if (areTissueSamplesGrouped(dataset)) {
            this.goBackToTissueSampleCollectionsWizard();  
          } else {
            this.goBackToTissueSamplesWizard();  
          }
        } else {
          this.goBackToExperiment();
        }
        break;
      default:
        this.goBackToExperiment();
        break;
    }
  };

  handleReset = () => {
    this.setState({
      dataset: undefined,
      general: undefined,
      fundingAndAffiliation: undefined,
      contributors: undefined,
      experiment: undefined,
      subjectGroups: null,
      subjectTemplate: null,
      subjects: [],
      tissueSamples: [],
      tissueSampleCollections: [],
      tissueSampleTemplate: null,
      schema: generalSchema,
      uiSchema: uiSchema,
      result: null,
      wizardStep: WIZARD_STEP_GENERAL
    });
  };

  render() {
    const schema = this.state.schema;
    switch (this.state.wizardStep) {
      case WIZARD_STEP_GENERAL:
        return (
          <GeneralWizard schema={schema} uiSchema={this.state.uiSchema} formData={this.state.general} onSubmit={this.handleGeneralSubmit} />
        );
      case WIZARD_STEP_DATASET:
        return (
          <DatasetWizard schema={schema} uiSchema={this.state.uiSchema} formData={this.state.datasetinfo} onSubmit={this.handleDatasetSubmit} onBack={this.handleGoBackToPreviousStepWizard}/>
        );  
      case WIZARD_STEP_FUNDING_AND_AFFILIATION:
        return (
          <FundingAndAffiliationWizard schema={schema} uiSchema={this.state.uiSchema} formData={this.state.fundingAndAffiliation} onSubmit={this.handleFundingAndAffiliationSubmit} onBack={this.handleGoBackToPreviousStepWizard} />
        );
      case WIZARD_STEP_CONTRIBUTORS:
        return (
          <ContributorsWizard schema={schema} uiSchema={this.state.uiSchema} formData={this.state.contributors} onSubmit={this.handleContributorsSubmit} onBack={this.handleGoBackToPreviousStepWizard} />
        );
      case WIZARD_STEP_EXPERIMENT:
        return (
          <ExperimentWizard schema={schema} uiSchema={this.state.uiSchema} formData={this.state.experiment} onSubmit={this.handleExperimentSubmit} onBack={this.handleGoBackToPreviousStepWizard} />
        );

      default:
        return (
          <Result result={this.state.result} onBack={this.handleGoBackToPreviousStepWizard} onReset={this.handleReset} />
        );
    }
  }
};

export default Wizard;