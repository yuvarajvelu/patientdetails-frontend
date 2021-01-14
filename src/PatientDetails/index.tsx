import React from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Patient, Diagnosis, Entry, OccupationalHealthcareEntry, HealthCheckEntry, HospitalEntry } from "../types";
import { apiBaseUrl } from "../constants";
import { useStateValue , setPatientDetails, setDiagnoseDetails } from "../state";
import { Icon, Segment, Button } from "semantic-ui-react";
import { PatientEntry } from "../AddPatientModal/index";
import { EntryForm } from "../AddPatientModal/AddPatientEntryForm";

const OccupationalHealthCare: React.FC<{ entry: OccupationalHealthcareEntry }> = ({ entry }) => {
    return (
        <Segment>
            <h4>{entry.date} <Icon name = "stethoscope" />  {entry.employerName}</h4>
            <em>{entry.description}</em> <br />
           
        </Segment>
    );
};

const Hospital: React.FC<{ entry: HospitalEntry }> = ({ entry }) => {
    return (
        <Segment>
            <h4>{entry.date} <Icon name = "hospital" /></h4>
            <em>{entry.description}</em>
        </Segment>
    );
};

const HealthCheck: React.FC<{ entry: HealthCheckEntry }> = ({ entry }) => {

    return (
        <Segment>
            <h4>{entry.date} <Icon name = "doctor" /></h4>
            <em>{entry.description}</em> <br />
            <Icon 
                color = {entry.healthCheckRating === 0 ? "green" : entry.healthCheckRating === 1 ? "yellow" : entry.healthCheckRating === 2 ? "orange" : "red" } 
                name = "heart" 
            />
        </Segment>
    );
};

const assertNever = (value: never): never => {
    throw new Error(`Unhandled discriminated union member ${JSON.stringify(value)}`);
};
const EntryDetails: React.FC<{ entry: Entry}> = ({entry}) =>{
    switch(entry.type) {
        case "OccupationalHealthcare":
            return <div><OccupationalHealthCare entry = {entry} /></div>;
        case "Hospital":
            return <div><Hospital entry = {entry} /></div>;
        case "HealthCheck":
            return <div><HealthCheck entry = {entry} /></div>;
        default:
            return assertNever(entry);
    }
};

const PatientDetailsPage: React.FC =  () => {
    const { id } = useParams<{ id: string }>();
    const [ {patient}, dispatch] = useStateValue();
    const [ {diagnoses}, dispatchDiagnosis] = useStateValue();
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | undefined>();

    const openModal = (): void => setModalOpen(true);

    const closeModal = (): void => {
        setModalOpen(false);
        setError(undefined);
    };
    const fetchPatientDetails = async () => {
        axios.get<void>(`${apiBaseUrl}/ping`);
        try {
            const { data: patientDetailsFromApi} = await axios.get<Patient>(`${apiBaseUrl}/patients/${id}`);
            dispatch(setPatientDetails(patientDetailsFromApi));
        } catch(e) {
            console.log(e.message);
        }
    };

    const fetchDiagnoseDetails = async () => {
        try {
            const { data: diagnosisDetails } = await axios.get<Diagnosis[]>(`${apiBaseUrl}/diagnoses`);
            dispatchDiagnosis(setDiagnoseDetails(diagnosisDetails));
        } catch(e) {
            console.log(e.message);
        }
    };

    const addPatientEntries = async (values: EntryForm ) => {
        try {
            const { data: editedPatient } = await axios.post<Patient>(`${apiBaseUrl}/patients/${id}/entries`,values);
            dispatch(setPatientDetails(editedPatient));
            closeModal();
        } catch(e) {
            console.error(e.response.data);
            setError(e.response.data.error);
        }
    };
    
    if(!patient[id]) {
        fetchDiagnoseDetails();
        fetchPatientDetails();
    } 
    const patientDetails = Object.values(patient).find(p => p.id === id);
    const getDiagnoseDetails = (code: string): string => {
        const codeDetails = Object.values(diagnoses).find(d => d.code === code) as Diagnosis;
        return codeDetails.name;
    };
    if (patientDetails) {
        const name = patientDetails.gender === "male" ? "mars" : "venus";
        
        return (
            <div>
                <h1>{patientDetails.name} <Icon name = {name} /></h1>
                <p>ssn: {patientDetails.ssn}</p>
                <p>dob: {patientDetails.dateOfBirth}</p>
                <p>occupation: {patientDetails.occupation}</p>
                <h2>entries</h2>
                {patientDetails.entries.map(p => (
                <div key = {p.id}>
                    <EntryDetails entry = {p} />
                    {p.diagnosisCodes && diagnoses? p.diagnosisCodes.map(c=> <ul key ={c}><li>{c}  {getDiagnoseDetails(c)}</li></ul>) : null}
                </div>))}
                <PatientEntry 
                    modalOpen={modalOpen}
                    onSubmit={addPatientEntries}
                    error={error}
                    onClose={closeModal}
                />
                <Button onClick={() => openModal()}>Add New Entry</Button>
            </div>
        );
    } else {
        return (
            <div></div>
        );
    }
};

export default PatientDetailsPage;