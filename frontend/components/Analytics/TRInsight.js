import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {TopMenuBarContainer} from 'components/ui/TopMenuBar';
import styles from './TRInsight.scss';
import {ProjectSideNavContainer} from 'components/Projects/ProjectSideNav';
import * as selectors from 'selectors';
import { useSelector, useDispatch } from 'react-redux';
import * as actions from 'actions';
import Loading from 'components/ui/Loading';
import moment from 'moment';
import {Link} from 'react-router-dom';
import Card from 'components/ui/Card';
import { extractTimeSeries } from 'util/util';
import { CardContent, CardContentLineArea, CardContentDouble } from 'components/ui/Card';
import _ from 'lodash';


function TRInsightHeader( {projectDetails} ) {
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
                    <h3 style={{flex: 1, fontSize: '24px', marginRight: '15px'}}> Daily Training Insight</h3> 
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

function TRInsightBody( {projectDetails, trInsights }) {
    const summaries = {
        performanceSummary: trInsights.output ? trInsights.output?.content?.[0]?.overall_performance?.summary: '',
        injuryAssessment: trInsights.output ? trInsights.output?.content?.[0]?.injury_assessment?.summary: '',
        emotionState: trInsights.output ? trInsights.output?.content?.[0]?.emotion_state?.summary: '',
        trendImprovement: trInsights.output ? trInsights.output?.content?.[0]?.trends_improvement?.summary: '',
        runningSummary: trInsights.output ? trInsights.output?.content?.[0]?.running_summary?.summary: '',
      };

    const chartInfo = {
        runningPerformanceAcc: trInsights.chart_info ? trInsights.chart_info.running_acc : null,
        anxietyLevel: trInsights.chart_info ? trInsights.chart_info.anxiety: null,
        stressLevel: trInsights.chart_info ? trInsights.chart_info.stress: null,
        exertionLevel: trInsights.chart_info ? trInsights.chart_info.exertion_level_avg: null,
        recoveryLevel: trInsights.chart_info ? trInsights.chart_info.recovery_level_avg: null,
        trainingSuccessLevel: trInsights.chart_info ? trInsights.chart_info.training_success_avg: null,
        strengthTrainingAvg: trInsights.chart_info ? trInsights.chart_info.strength_training_avg: null,
        trainingDuration: trInsights.chart_info ? trInsights.chart_info.training_duration: null,
        injuryType: trInsights.chart_info ? trInsights.chart_info.injury_type_converted: null,
    };

    const emptyView = (graphic, btnText, btnLink, emptyText) => {
        return (
            <div className={styles.empty}>
                {emptyText ? (
                    <>
                        <br />
                        <p>{emptyText}</p>
                    </>
                ): (
                    ''    
                )}
                {graphic}
                {btnLink ? (
                    <Link className="btn btn-secondary btn-small" to={btnLink}>
                        <i className="icon icon-plus" /> {btnText}
                    </Link>
                ): (
                    ''
                )}
            </div>
        );
    };

    const performanceCard = ( summary ) => {
        return (
            <Card 
                title='Insight Summary'
                maxheight={320}>
                    <div className={styles.cardContentText} style={{fontSize: 17}}>
                        {summary} 
                    </div>
            </Card>
        );
    };

    const runningCard = ( running ) => {
        if (_.isNil(chartInfo.runningPerformanceAcc)) {
            return (<></>);
        }
        const {keys, values} = extractTimeSeries(chartInfo.runningPerformanceAcc);
        return (
            <Card 
                title='Running Performance'
                maxwidth={'50%'}>
                    <CardContent
                        desc={running}
                        data={values} 
                        xaxis={keys}
                        type={'bar'}
                        width={'100%'}
                        />
            </Card>
        );
    };

    const emotionCard = ( emotion ) => {

        if (_.isNil(chartInfo.anxietyLevel) || _.isNil(chartInfo.stressLevel)) {
            return (<></>);
        }
        const {keys: keys_anxiety, values: values_anxiety} = extractTimeSeries(chartInfo.anxietyLevel);
        const {keys: keys_stress , values: values_stress} = extractTimeSeries(chartInfo.stressLevel);
        return (
            <Card 
                title='Emotion Status'
                maxwidth={'50%'}>
                    <CardContentDouble
                        desc={emotion}
                        series={[values_anxiety, values_stress]}
                        labels={[keys_anxiety, keys_stress]}
                        type={'donut'}
                        titles={['Anxiety', 'Stress']}
                        />
            </Card>
        );
    };

    const injuryCard = ( injury ) => {
        if (_.isNil(chartInfo.injuryType) || _.isNil(chartInfo.trainingDuration)) {
            return (<></>);
        }
        const {keys: keys_training_duration, values: values_training_duration} = extractTimeSeries(chartInfo.trainingDuration);
        const {keys: keys_injury_type, values: values_injury_type} = extractTimeSeries(chartInfo.injuryType);
        return (
            <Card 
                title='Injury Status and Training Duration'
                maxWidth={'50%'}>
                    <CardContentLineArea
                        desc={injury}
                        series={[values_training_duration, values_injury_type]}
                        type={'line'}
                        labels={[keys_training_duration, keys_injury_type]}
                        titles={['Training Duration']}
                        />
            </Card>
        );
    };

    const trendCard = ( trend ) => {
        const keys = ['Recovery', 'Exertion', 'Success', 'Strength'];
        const series = [chartInfo.recoveryLevel, chartInfo.exertionLevel, chartInfo.trainingSuccessLevel, chartInfo.strengthTrainingAvg];
        return (
            <Card 
                title='Trend and Improvement'
                maxWidth={'50%'}>
                    <CardContent 
                        desc={trend}
                        xaxis={keys}
                        data={series}
                        type='radar'
                        width={300}
                        height={350}
                        />
            </Card>
        );
    };

    return (
        <>
            <div className={styles.home}>
                <div className={styles.grid}>
                    <div className={styles.row}>
                        {performanceCard(summaries['performanceSummary'])}
                        
                    </div>
                    <div className={styles.row}>
                        {runningCard(summaries['runningSummary'])}
                        {emotionCard(summaries['emotionState'])}
                    </div>
                    <div className={styles.row}>
                        {injuryCard(summaries['injuryAssessment'])}
                        {trendCard(summaries['trendImprovement'])}
                    </div>
                </div>
            </div>
        </>
    );
}

const TRInsightView = ({ projectDetails }) => {
    // fetch insights and data points for charts
    const dispatch = useDispatch();
    const {id} = projectDetails;
    const currentUser = useSelector(selectors.currentUser);
    const [loading, setLoading] = useState(false);
    const [insight, setInsight] = useState({});

    useEffect(() => {
        const fetchTrainingInsight = async() => {
            try { 
                setLoading(true);
                dispatch(actions.TRInsight.trInsightsGetSummary({project_id:id, person_id:currentUser.id, pipeline_type:'daily_insight'}))
                .withMeta.then((resp) => {
                    setInsight(resp.response);
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error fetching project insights: ', error);
            }
        };
        fetchTrainingInsight();
    }, []);

    return (
        <div className={styles.projectStatusContainer}>
            {<TRInsightHeader projectDetails={projectDetails}/>} 
            {loading ? <Loading/>: <TRInsightBody projectDetails={projectDetails} trInsights={insight}/>}
        </div>
    );
};
    
const TRInsightContainer = () => { 
    const { projectId } = useParams();
    const [projectDetails, setProjectDetails] = useState(null);
    const [breadcrumbItems, setBreadcrumbItems] = useState(['InjuryShield']); 
    const dispatch = useDispatch();

    useEffect(() => {

        const fetchProjectDetails = async () => {
            try {
                dispatch(actions.Project.projectsGet(projectId))
                .withMeta.then((resp) => {
                    setProjectDetails(resp.response);
                    setBreadcrumbItems(['InjuryShield', resp.response.title, 'Daily Insight']);
                });
            } catch (error) {
                console.error('Error fetching project details: ', error);
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
                    {projectDetails && <TRInsightView projectDetails={projectDetails} />}
                </div>
            </div>
        </div>
    );
};

export default TRInsightContainer;
