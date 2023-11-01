import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {TopMenuBarContainer} from 'components/ui/TopMenuBar';
import styles from './ProjectHome.scss';
import {ProjectSideNavContainer} from 'components/Projects/ProjectSideNav';
import * as selectors from 'selectors';
import { useSelector, useDispatch } from 'react-redux';
import * as actions from 'actions';
import Loading from 'components/ui/Loading';
import moment from 'moment';
import {Link} from 'react-router-dom';
import Card from 'components/ui/Card';
import {numRound} from 'util/numbers';
import {truncateParagraph} from 'util/strings';
import _ from 'lodash';
import { extractTimeSeries } from 'util/util';
import {CardContent, CardContentDonut} from 'components/ui/Card';

const DisplayStat = ({value, label, unit}) => {

    return (
        <div className={styles.statContainer}>
            <div className={styles.numberUnit}>
                <div className={styles.bigNumber}>{value}</div>
                <div className={styles.unit}>{unit}</div>
            </div>
            <div className={styles.label}>{label}</div>
        </div>

    );
};

function ProjectStatusHeader( {projectDetails} ) {
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
                    <h3 style={{flex: 1, fontSize: '24px', marginRight: '15px'}}> Hi, {currentUser.first_name}</h3> 
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

function ProjectStatusBody( {projectDetails, coaching }) {

    const summaries = {
        coachingSummary: coaching.output ? coaching.output.content[0]?.coaching_summary?.summary: '', 
        performanceSummary: coaching.output ? coaching.output.content[0]?.statistics: null,
        diarySummary: coaching.output ? coaching.output.content[0]?.diary: '',
      };

    const chartInfo = {
        runningPerformanceAcc: coaching.chart_info ? coaching.chart_info.running_acc : null,
        diaryRecord: coaching.chart_info ? coaching.chart_info.diary_record : null,
        injuryRecord: coaching.chart_info ? coaching.chart_info.injury_type : null
    };

    const location = useLocation();
    const currentURL = location.pathname;
    const [loading, setLoading] = useState(true);
    const [runningData, setRunningData] = useState({});
    const [predictionData, setPredictionData] = useState({});
    const {id} = projectDetails;
    const currentUser = useSelector(selectors.currentUser);
    const dispatch = useDispatch();

    useEffect(() => {
        let isMounted = true;
        const fetchData = async (pipelineType) => {
            try {
                dispatch(actions.TRInsight.trInsightsGetSummary({
                    project_id: id,
                    person_id: currentUser.id,
                    pipeline_type: pipelineType,
                })).withMeta.then((resp) => {
                    if (isMounted && pipelineType === 'daily_insight') {
                        setRunningData(resp.response);
                    }
                    if (isMounted && pipelineType === 'daily_prediction') {
                        setPredictionData(resp.response);
                    }
                });
            } catch (error) {
                console.error(`Error fetching ${pipelineType} data`, error);
            }
        };

        (async () => {
            fetchData('daily_insight');
            fetchData('daily_prediction');
            setLoading(false);
        })();

        return () => {
            isMounted = false;
        };
    }, [dispatch, id, currentUser.id]);

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
        const {mileage, strength, recovery} = summary ? summary: {};
        return (
            <Card 
                title='Recent Activities'
                maxWidth={'40%'}
                maxheight={320}>
                    <div className={styles.activityContainer}>
                        {mileage? <DisplayStat value={numRound(mileage, 1)} label={"Running"} unit={"miles"}/>: ''}
                        {strength? <DisplayStat value={strength} label={"Srength"} unit={"times"}/>: ''}
                        {recovery? <DisplayStat value={numRound(recovery,1)} label={"Recovery"} unit={"%"}/>: ''}
                    </div>
            </Card>
        );
    };

    const overallSummaryCard = ( coaching ) => {
        return (
            <Card 
                title='Coaching Summary'
                maxWidth={'60%'}>
                    <div className={styles.cardContentText} style={{fontSize: 17}}>
                        {coaching}
                    </div>
            </Card>
        );
    };

    const dailyInsightCard = ( running ) => {
        if (_.isNil(chartInfo.runningPerformanceAcc)) {
            return <></>;
        }
        const {keys, values} = extractTimeSeries(chartInfo.runningPerformanceAcc);
        const series = [{name: 'Running', data: values}];
        const runnings = {
            performance: runningData && runningData.output ? (runningData.output.content[0]?.overall_performance?.summary || '') : '',
          };
        return (
            <Card 
                title='Daily Insight'
                linkTo={currentURL + '/insight'}
                maxWidth={'35%'}>
                    <CardContent
                        desc={truncateParagraph(runnings.performance, 30)}
                        series={series}
                        xaxis={keys}
                        type={'bar'}
                        height={200}
                        width={'100%'}
                        title={'Accumulated running distance'}
                        />
            </Card>
        );
    };

    const injuryPredictionCard = (data) => {
        const keys = ['None', 'Mild', 'Medium', 'Serious', 'Emergency'];
        const values = keys.map(key => {
            const value = chartInfo.injuryRecord ? chartInfo.injuryRecord[key]: 0;
            return value === 0 ? 0.1: value;
        }); 
        const predictions = {
            injury_prediction: predictionData.output?.content?.[0]?.injury_prediction?.summary || '',
          };
        return (
            <Card 
                title='Injury Prediction'
                linkTo={currentURL + '/predict'}
                maxWidth={'35%'}>
                    <CardContentDonut
                        desc={truncateParagraph(predictions.injury_prediction, 40)}
                        type='donut'
                        series={[values]} 
                        labels={[keys]} 
                        width={'100%'}
                        height={250}
                        />
            </Card>
        );
    };

    const trainingDiaryCard = ( diary ) => {

        if (_.isNil(chartInfo.diaryRecord)) {
            return (<></>);
        }
        const {keys, values} = extractTimeSeries(chartInfo.diaryRecord);
        const series = [{name: 'Record count', data: values.slice(-7)}];
        const {summary} = diary;
        return (
            <Card 
                title='Training Diary'
                linkTo={currentURL + '/diary'}
                maxWidth={'35%'}>
                    <CardContent
                        desc={truncateParagraph(summary, 40)}
                        type='area'
                        series={series}
                        xaxis={keys.slice(-7)}
                        height={200}
                        width={'100%'}
                        title={'Accumulated Training Record (last 7 days)'}
                        />
            </Card>
        );
    };

    return (
        <div className={styles.home}>
            <div className={styles.grid}>
                <div className={styles.row}>
                    {performanceCard(summaries['performanceSummary'])}
                    {overallSummaryCard(summaries['coachingSummary'])}
                    
                </div>
                {loading ? <Loading /> : 
                    (<div className={styles.row}>
                        {dailyInsightCard()}
                        {injuryPredictionCard(predictionData)}
                        {trainingDiaryCard(summaries['diarySummary'])}
                    </div>
                )}
            </div>
        </div>
    );
}

const ProjectStatus = ({ projectDetails }) => {
    // fetch insights and data points for charts
    const dispatch = useDispatch();
    const {id} = projectDetails;
    const currentUser = useSelector(selectors.currentUser);
    const [loading, setLoading] = useState(false);
    const [coaching, setCoaching] = useState({});

    useEffect(() => {
        const fetchCoachingSummary = async() => {
            try { 
                setLoading(true);
                dispatch(actions.TRInsight.trInsightsGetSummary({project_id:id, person_id:currentUser.id, pipeline_type:'coaching_summary'}))
                .withMeta.then((resp) => {
                    setCoaching(resp.response);
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error fetching project insights: ', error);
            }
        };
        fetchCoachingSummary();
    }, []);

    return (
        <div className={styles.projectStatusContainer}>
            {<ProjectStatusHeader projectDetails={projectDetails}/>} 
            {loading ? <Loading/>: <ProjectStatusBody projectDetails={projectDetails} coaching={coaching}/>}
        </div>
    );
};
    
const ProjectHomeContainer = () => { 
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
                    setBreadcrumbItems(['InjuryShield', resp.response.title, 'Home']);
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
                    {projectDetails && <ProjectStatus projectDetails={projectDetails} />}
                </div>
            </div>
        </div>
    );
};

export default ProjectHomeContainer;
