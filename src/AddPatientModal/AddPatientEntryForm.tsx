import { Field, Formik } from "formik";
import React from "react";
import { Button, Form, Grid } from "semantic-ui-react";
import { useStateValue } from "../state";
import { BaseEntry,  HealthCheckRating, DischargeType, LeaveInfo, EntriesType  } from "../types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DiagnosisSelection, TextField, EntryOption, EntrySelectField, NumberField } from "./FormField";
type NewEntryBase = Omit<BaseEntry, "id">;

interface HealthCheckEntries extends NewEntryBase {
    type: "HealthCheck";
    healthCheckRating: HealthCheckRating;
}

export interface OccupationalHealthcareEntries extends NewEntryBase  {
    type: "OccupationalHealthcare";
    employerName: string;
    sickLeave?: LeaveInfo;
}

interface HospitalEntries extends NewEntryBase {
    type: "Hospital";
    discharge: DischargeType;
}

export interface EntryForm extends NewEntryBase {
    type: "HealthCheck" | "OccupationalHealthcare" | "Hospital";
    healthCheckRating: HealthCheckRating;
    employerName: string;
    sickLeave?: LeaveInfo;
    discharge: DischargeType;
}

export type NewEntryDetails = HealthCheckEntries | OccupationalHealthcareEntries | HospitalEntries;

const entryOption: EntryOption[] = [
    {value: EntriesType.OccupationalHealthcare, label: "Occupational Health Care"},
    {value: EntriesType.HealthCheck, label: "Health Check"},
    {value: EntriesType.Hospital, label: "Hospital"} 
];

interface Props {
    onSubmit: (values: EntryForm) => void;
    onCancel: () => void;
}

const AddPatientEntryForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
    const [ {diagnoses} ] = useStateValue();
    return (
        <Formik 
        initialValues={{
            date: "",
            description: "",
            specialist: "",
            diagnosisCodes: [],
            type: "OccupationalHealthcare",
            employerName: "",
            discharge: {
                date: "",
                criteria: ""
            },
            sickLeave: {
                startDate: "",
                endDate: ""
            },
            healthCheckRating: 0,     
        }}
        onSubmit={onSubmit}
        validate={values => {
            const usualError = "Field is missing or invalid";
            const error: { [field: string ]: string} = {};
            if(!values.date || !Date.parse(values.date)) {
                error.date = usualError;
            } 
            if(!values.description || typeof values.description !== "string") {
                error.description = usualError;
            }  
            if(!values.specialist || typeof values.specialist !== "string") {
                error.specialist = usualError;
            } 
            if(values.type === "OccupationalHealthcare") {
                if(!values.employerName || typeof values.employerName !== "string") {
                    error.employerName = usualError;
                }
            }
            
            return error;
        }}
        > 
        {({ values, isValid, dirty, setFieldValue, setFieldTouched , handleSubmit}) => {
            return (
                <Form className = "form ui" onSubmit={handleSubmit}>
                    <Field label = "Date" placeholder = "YYYY-MM-DD" name = "date" component = {TextField} />
                    <Field label = "Description" placeholder = "Description" name = "description" component = {TextField} />
                    <Field label = "Specialist" placeholder = "Specialist" name = "specialist" component = {TextField} />
                    <DiagnosisSelection
                        setFieldValue = {setFieldValue}
                        setFieldTouched = {setFieldTouched}
                        diagnoses = {Object.values(diagnoses)}
                    />
                    <EntrySelectField name = "type" label = "EntryType" options = {entryOption} />
                    { values.type === "OccupationalHealthcare" && (
                         <><Field label = "EmployerName" placeholder = "EmployerName" name = "employerName" component = {TextField} />
                         <Field label = "StartDate" placeholder = "YYYY-MM-DD" name = "sickLeave.startDate" component = {TextField} />
                         <Field label = "EndDate" placeholder = "YYYY-MM-DD" name = "sickLeave.endDate" component = {TextField} /></>
                    )}
                   
                    { values.type === "HealthCheck" &&  <Field label = "HealthCheckRating" placeholder = "HealthCheckRating"  name="healthCheckRating" min = {0} max = {3} disabled={values.type !== "HealthCheck"}  component = {NumberField} />}
                    
                    {values.type === "Hospital" &&(
                        <>
                            <Field label = "Discharge Date" placeholder = "YYYY-MM-DD" name = "discharge.date" disabled={values.type !== "Hospital"} component = {TextField} />
                            <Field label = "Criteria" placeholder = "criteria" name = "discharge.criteria" disabled={values.type !== "Hospital"}  component = {TextField} />
                        </>
                    )}
                    
                   
                        
                    <Grid>
                        <Grid.Column floated = "left" width = {5}>
                            <Button type="button" onClick = {onCancel} color = "red">
                                Cancel
                            </Button>
                        </Grid.Column>
                        <Grid.Column floated = "right" width = {5}>
                            <Button type="submit" floated="right" color = "green" disabled = {!isValid || !dirty}>
                                Add entry
                            </Button>
                        </Grid.Column>
                    </Grid>
                </Form>
            );
        }}
        </Formik>
    );
};

export default AddPatientEntryForm;