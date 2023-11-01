import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {TopMenuBarContainer} from 'components/ui/TopMenuBar';
import styles from './TRPredict.scss';
import {ProjectSideNavContainer} from 'components/Projects/ProjectSideNav';
import * as selectors from 'selectors';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import * as actions from 'actions';
import Loading from 'components/ui/Loading';
import Card from 'components/ui/Card';
import FlexTable from 'components/ui/Table';
import {CardContentDonut} from 'wolf/components/ui/Card';
import _ from 'lodash';


function TRPredictHeader( {projectDetails} ) {
    const[showModal, setShowModal] = useState(false);
    const currentUser = useSelector(selectors.currentUser);

    return (
        <div 
            className="flex flex-col gap-16"
            style={{
                backgroundColor: 'var(--bg)',
                borderLeft: '1px var(--border) solid',
                borderBottom: '1px var(--border-400) solid',
                padding: '24px 24px',
            }}>
            <div className="flex flex-row" style={{alignItems: 'center', justifyContent: 'space-between'}}>
                <div className="flex flex-row" style={{alignItems: 'flex-end'}}>
                    <h3 style={{flex: 1, fontSize: '24px', marginRight: '15px'}}>Injury Prediction with AI Coach</h3> 
                    {moment().format('MMMM D, YYYY')} 
                </div>
                <div>
                    <button
                        className="btn btn-small btn-secondary"
                        onClick={() => setShowModal(true)}> 
                        <i className="icon icon-setting" /> Settings
                    </button>
                </div>
            </div>
        </div>
    );
}

function TRPredictBody( {projectDtails, trPredict} ) {
    
    const predictions = {
        injury_prediction: trPredict.output ? trPredict.output?.content?.[0]?.injury_prediction?.summary: '',
        injury_avoidance: trPredict.output ? trPredict.output?.content?.[0]?.injury_avoidance: '',
        daily_schedule: trPredict.output ? trPredict.output?.content?.[0]?.daily_schedule: '',
      };
    const chartInfo = {
        injuryRecord: trPredict.chart_info ? trPredict.chart_info.injury_type : null,
    };

    const avoidanceKeys = predictions.injury_avoidance? Object.keys(predictions.injury_avoidance): null; 

    const injuryPredictionCard = (data) => {

        const keys = ['None', 'Mild', 'Medium', 'Serious', 'Emergency'];
        const values = keys.map(key => {
            const value = chartInfo.injuryRecord? chartInfo.injuryRecord[key]: 0;
            return value === 0 ? 0.1: value;
        }); 
        return (
            <Card 
                title='Injury Forecast'>
                    <CardContentDonut
                        desc={predictions.injury_prediction}
                        type='donut'
                        series={[values]}
                        labels={[keys]}
                        sideBySide={true}
                        height={400}
                        width={400}
                        />
            </Card>
        );
    };  


    const injuryAvoidanceCard = ( suggestions ) => {

        return (
            <Card 
                title='Injury Prevention'
                //maxWidth={'50%'}
                maxHeight={320}>
                    <div className={styles.cardContentText} style={{fontSize: 17}}>
                        {
                            (_.isNil(avoidanceKeys) || avoidanceKeys.length === 0)? 'No suggestion': 
                                <ul> 
                                    {avoidanceKeys.map((key) => (
                                        <li key={key}> {predictions.injury_avoidance[key]}</li>
                                    ))}
                                </ul>
                        }
                    </div>
            </Card>
        );
    };

    const trainingScheduleCard = ( schedules ) => {

        const renderTable = () => {
            if (_.isNil(schedules)) {
                return <></>;
            }
            const days = Object.keys(schedules);
            const cellClassNames = [
                'flex1',
                'flex1',
                'flex12',
                'flex2', 
                'flex1'
            ];

            const columns = ['Day', 'Distance', 'Reasoning', 'Strength', 'Fatigue'];
            const rawData = days.map((day) => [day, schedules[day].distance, schedules[day].justification, schedules[day].strength, schedules[day].fatigue]); 

            return (
                <FlexTable columns={columns} data={rawData} cellClassNames={cellClassNames}/>
            );
        };

        return (
            <Card 
                title='Injury-safe Training Schedule' 
                maxheight={500}>
                    {renderTable()}
            </Card>
        );
    };

    return (
        <>
            <div className={styles.home}>
                <div className={styles.grid}>
                    <div className={styles.row}>
                        {injuryPredictionCard(predictions['injury_prediction'])}
                    </div>
                    <div className={styles.row}>
                        {injuryAvoidanceCard(predictions['injury_avoidance'])}
                    </div>
                    <div className={styles.row}>
                        {trainingScheduleCard(predictions['daily_schedule'])}
                    </div>
                </div>
            </div>    
        </>
    );
}

const TRPredictView = ({ projectDetails }) => {
    const dispatch = useDispatch();
    const {id} = projectDetails;
    const currentUser = useSelector(selectors.currentUser);
    const [loading, setLoading] = useState(false);
    const [predict, setPredict] = useState({});

    useEffect(() => {
        const fetchTrainingPrediction = async() => {
            try { 
                setLoading(true);
                dispatch(actions.TRInsight.trInsightsGetSummary({project_id:id, person_id:currentUser.id, pipeline_type:'daily_prediction'}))
                .withMeta.then((resp) => {
                    setPredict(resp.response);
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error fetching project insights: ', error);
            }
        };
        fetchTrainingPrediction();
    }, []);

    return (
        <div className={styles.projectStatusContainer}>
            {<TRPredictHeader projectDetails={projectDetails}/>} 
            {loading ? <Loading/>: <TRPredictBody projectDetails={projectDetails} trPredict ={predict}/>}
        </div>
    );
};
    
const TRPredictContainer = () => { 
    const { projectId } = useParams();
    const [projectDetails, setProjectDetails] = useState(null);
    const [breadcrumbItems, setBreadcrumbItems] = useState(['InjuryShield']); 

    useEffect(() => {

        const fetchProjectDetails = async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}`);
                const data = await response.json();
                setProjectDetails(data['response']);
                setBreadcrumbItems(['InjuryShield', data['response'].title, 'Prediction']);

            } catch (error) {
                console.error('Error fetching project details:', error);
            }
        };

        fetchProjectDetails();
    }, [projectId]);

    return (
        <div className={styles.root}>
            <ProjectSideNavContainer projectId={projectId}/>
            <div className = {styles.content}>
                <div className = {styles.projectHomeConatiner}>
                    <TopMenuBarContainer breadcrumbItems={breadcrumbItems} />
                    {projectDetails && <TRPredictView projectDetails={projectDetails} />}
                </div>
            </div>
        </div>
    );
};

export default TRPredictContainer;
