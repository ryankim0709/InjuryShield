import React, { createContext, useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {TopMenuBarContainer} from 'components/ui/TopMenuBar';
import styles from './TRRecords.scss';
import {ProjectSideNavContainer} from 'components/Projects/ProjectSideNav';
import { useSelector, useDispatch} from 'react-redux';
import _ from 'lodash';
import useTRRecords from './useTRRecords';

import * as actions from 'actions';
import * as selectors from 'selectors';
import Modal from 'components/ui/Modal';
import Form from 'components/ui/Forms';
import RadioGroup from 'components/ui/RadioGroup';
import Select from 'components/ui/Select';
import {TimePeriodSelect} from 'components/ui/TimeSelect';
import TimeSelect from 'components/ui/TimeSelect';
import moment from 'moment';
import DatePicker from 'components/ui/DatePicker';
import Slider from 'components/ui/Slider';
import Paginator from 'components/ui/Paginator';
import Card from 'components/ui/Card';
import Loading from 'components/ui/Loading';
import { extractTimeSeries } from 'util/util';
import { CardContent } from 'components/ui/Card';

export class TrainingRecordOptions {
    static INJURY_LOCATIONS = [
        {label: 'None', value: 'none'},
        {label: 'Knee', value: 'knee'},
        {label: 'Ankle', value: 'ankle'},
        {label: 'Calf', value: 'calf'},
        {label: 'Hip', value: 'hip'},
        {label: 'Thigh', value: 'thigh'},
        {label: 'Shin', value: 'shin'},
        {label: 'Lower back', value: 'lower_back'},
        {label: 'Foot', value: 'foot'},
    ];
    static INJURY_TYPE= [
        {label: 'Mild', value: 'mild'},
        {label: 'Medium', value: 'medium'},
        {label: 'Serious', value: 'serious'},
        {label: 'Emergency', value: 'emergency'},
    ];
    static ATHLETIC_PARTICIPATION= [
        {label: 'Part-Time', value: 'part'},
        {label: 'Full-Time', value: 'full'},
        {label: 'Hobby', value: 'hobby'},
    ];
}

function TRRecordViewModal ({
    trRecord = 
            {'title': '', 
                'state_of_fitness': 'normal', 
                'anxiety': 'none', 
                'stress': 'none', 
                'has_injury': 'none',
                'existing_injury': 'none',
                'injury_mode': 'gradual',
                'circumstances': 'training',
                'strength_training': 'none',
                'running_distance': 0,
                'sprinting_distance': 0,
                'injury_location': 'none',
                'injury_type': 'none',
                'athletic_participation': 'full',
                'training_duration': '01:00:00', 
                'record_date': moment().format('YYYY-MM-DD'),
                'time_went_to_bed': '22:00:00',
                'time_wakeup': '06:00:00', 
                'exertion_level': 50,
                'training_success': 50,
                'recovery_level': 50,
            }, onHide, projectId, currentUser, deleteRecord }) {
    const [hasChanged, setHasChanged] = useState(false);
    const [formState, setFormState] = useState({...trRecord, projectId: projectId, personId: currentUser.id});
    const dispatch = useDispatch();

    const handleFormStateChange = (object) => {
        setFormState({...formState, ...object});
        setHasChanged(true);
    };
    
    const onSave = () => {
        if (trRecord && _.get(trRecord, 'id')) {
            dispatch(actions.TRRecord.trRecordsUpdateSave(formState));
        } else {
            // create
            dispatch(actions.TRRecord.trRecordsCreate(formState));
        }
        onHide();
    };

    const onDelete = () => {
        if (!confirm('Are you sure you want to archive this diary?')){
            return;
        }

        dispatch(actions.TRRecord.trRecordsDelete(trRecord));
        deleteRecord(trRecord);
        onHide();
    };


    const handleSliderChange = (variable, value) => {
        setFormState({...formState,...{[variable]: value}}); 
        setHasChanged(true);
    };

    const mileOptions = () => {
        const options = [];
        for (let miles = 0; miles <= 20; miles += 0.5) {
            options.push({ label: `${miles} miles`, value: miles});
        }

        return options;
    };

    const renderDiaryGeneral = () => {
        return (
            <>
                <div className={`flex gap-16 ${styles.formRow}`}>
                    <div className="flex2" >
                        <h5> Title </h5>
                        <input
                            type="text"
                            value={_.get(formState, 'title')} 
                            name='title'
                            placeholder="Enter a title"
                            className={styles.formInput} 
                        />
                    </div> 
                    <div className="flex1" style={{padding: '0px 20px' }}>
                        <h5> Date </h5>
                        <DatePicker
                            name="record_date"
                            dateFormat="MM/DD/YYYY"
                            selected={moment(_.get(formState, 'record_date'), 'YYYY-MM-DD')} 
                            //value={_.get(formState, 'date')} 
                            className={styles.formInput} 
                        />
                    </div> 
                </div>
            </>
        );
    };
    const renderSleepDetails = () => {
        return (
            <>
                <div className={`flex gap-16 ${styles.formRow}`}>
                    <div className={styles.formField}>
                        <label
                            className={styles.formLabel}>
                                Sleep Details
                            </label>
                    </div>
                </div>
                <hr className={styles.sectionDivider} />
                <div className={`flex gap-16 ${styles.formRow}`}>
                    <div className="flex1" >
                        <h5> Went to bed at </h5>
                        <TimeSelect 
                            value={_.get(formState, 'time_went_to_bed')} 
                            name='time_went_to_bed'
                            placeholder="Pick a time"
                            className={styles.formInput} 
                        />
                    </div> 
                    <div className="flex1" style={{padding: '0px 20px' }}>
                        <h5> Woke up at </h5>
                        <TimeSelect 
                            value={_.get(formState, 'time_wakeup')} 
                            name='time_wakeup'
                            placeholder="Pick a time"
                            className={styles.formInput} 
                        />
                    </div> 
                </div>
            </>
        );
    };

    const renderEmotions = () => {
        return (
            <>
                <div className={`flex gap-16 ${styles.formRow}`}>
                    <div className={styles.formField}>
                        <label
                            className={styles.formLabel}>
                                Emotions 
                            </label>
                    </div>
                </div>
                <hr className={styles.sectionDivider} />
                <div className={`flex gap-16 ${styles.formRow}`}> 
                    <h5> State of fitness </h5>
                    <div style={{maxWidth:'10px'}}/>
                    <RadioGroup 
                        name="state_of_fitness"
                        value={_.get(formState, 'state_of_fitness')} asRow>
                            <RadioGroup.Option
                                value="normal"
                                text="Normal"
                                />
                            <RadioGroup.Option
                                value="fatigue"
                                text="Fatigue" />
                            <RadioGroup.Option
                                value="pain"
                                text="Pain" />
                    </RadioGroup>
                </div>
                <div className={`flex gap-16 ${styles.formRow}`}>
                    <h5> Stress </h5>
                    <RadioGroup 
                        name="stress"
                        value={_.get(formState, 'stress')} asRow>
                            <RadioGroup.Option
                                value="none"
                                text="None"
                                />
                            <RadioGroup.Option
                                value="low"
                                text="Low" />
                            <RadioGroup.Option
                                value="medium"
                                text="Medium" />
                            <RadioGroup.Option
                                value="high"
                                text="High" />
                    </RadioGroup>
                </div>
                <div className={`flex gap-16 ${styles.formRow}`}>
                        <h5> Anxiety </h5>
                        <RadioGroup 
                            name="anxiety"
                            value={_.get(formState, 'anxiety')} asRow> 
                                <RadioGroup.Option
                                    value="none"
                                    text="None"
                                    />
                                <RadioGroup.Option
                                    value="concern"
                                    text="Concern" />
                                <RadioGroup.Option
                                    value="tension"
                                    text="Tension" />
                                <RadioGroup.Option
                                    value="confident"
                                    text="Cofident" />
                        </RadioGroup>
                </div>
            </>
        );
    };

    const renderTrainingDetails = () => {

        return (
            <>
                <div className={`flex gap-16 ${styles.formRow}`}>
                    <div className={styles.formField}>
                        <label
                            className={styles.formLabel}>
                                Training Details
                            </label>
                    </div>
                </div>
                <hr className={styles.sectionDivider} />
                <div className={styles.formRow}>
                    <h5> Strength training </h5>
                    <RadioGroup 
                        name='strength_training'
                        value={_.get(formState, 'strength_training')} asRow>
                            <RadioGroup.Option
                                value="yes"
                                text="Yes"
                                />
                            <RadioGroup.Option
                                value="no"
                                text="No" />
                    </RadioGroup>
                </div>
                <div className={`flex gap-16 ${styles.formRow}`}>
                    <div className="flex1" style={{padding: '0px 0px' }}>
                        <div className={styles.formRow}>
                            <h5> Training Duration </h5>
                            <TimePeriodSelect
                                name="training_duration"
                                placeholder="How long did you train?"
                                value={_.get(formState, 'training_duration')}
                                minuteInterval={30}
                            />
                        </div>
                    </div>
                    <div className="flex1" style={{padding: '0px 5px' }}>
                        <div className={styles.formRow}>
                            <h5> Running distance </h5>
                            <Select
                                name="running_distance"
                                placeholder="Running miles?"
                                value={_.get(formState, 'running_distance', 0)} 
                                options={mileOptions()}
                            />
                        </div>
                    </div>
                    <div className="flex1" style={{padding: '0px 5px' }}>
                        <div className={styles.formRow}>
                            <h5> Sprinting distance</h5>
                            <Select
                                name="sprinting_distance"
                                placeholder="Sprinting miles?"
                                value={_.get(formState, 'sprinting_distance', 0)} 
                                options={mileOptions()}
                            />
                        </div>
                    </div>
                </div>
                <div className={`flex gap-16 ${styles.formRow}`}>
                    <div className="flex1" >
                        <h5> Exertion Level </h5>
                        <Slider
                            defaultValue={0}
                            max={100}
                            minStepsBetweenThumbs={1}
                            onValueChange={(e) => handleSliderChange('exertion_level', e[0])}
                            step={5}
                            value={[_.get(formState, 'exertion_level')]}
                        />
                    </div> 
                    <div className="flex1" style={{padding: '0px 10px' }}>
                        <h5> Training Success </h5>
                        <Slider
                            defaultValue={100} 
                            max={100}
                            minStepsBetweenThumbs={1}
                            onValueChange={(e) => handleSliderChange('training_success', e[0])}
                            step={5}
                            value={[_.get(formState, 'training_success')]}
                        />
                    </div> 
                    <div className="flex1" style={{padding: '0px 10px' }}>
                        <h5> Recovery Level </h5>
                        <Slider
                            defaultValue={100} 
                            max={100}
                            minStepsBetweenThumbs={1}
                            onValueChange={(e) => handleSliderChange('recovery_level', e[0])}
                            step={5}
                            value={[_.get(formState, 'recovery_level')]}
                        />
                    </div> 
                </div>
            </>
        );
    };
    const renderInjuryDetals = () => {
        return (
            <>
                <div className={`flex gap-16 ${styles.formRow}`}>
                    <div className={styles.formField}>
                        <label
                            className={styles.formLabel}>
                                Injury Details
                            </label>
                    </div>
                </div>
                <hr className={styles.sectionDivider} />
                <div className={`flex gap-16 ${styles.formRow}`}>
                    <div className="flex1" >
                        <h5> Injury occured </h5>
                        <RadioGroup 
                            name='has_injury'
                            value={_.get(formState, 'has_injury')}>
                                <RadioGroup.Option
                                    value="yes" 
                                    text="Yes"
                                    />
                                <RadioGroup.Option
                                    value="no" 
                                    text="No" />
                        </RadioGroup>
                    </div>
                    <div className="flex1" style={{padding: '0px 15px' }}>
                        <h5> Existing injury </h5>
                        <RadioGroup 
                            name='existing_injury'
                            value={_.get(formState, 'existing_injury')}>
                                <RadioGroup.Option
                                    value="yes" 
                                    text="Yes"
                                    />
                                <RadioGroup.Option
                                    value="no"
                                    text="No" />
                        </RadioGroup>
                    </div> 
                    <div className="flex1" style={{padding: '0px 15px' }}>
                        <h5> Injury mode </h5>
                        <RadioGroup 
                            name="injury_mode"
                            value={_.get(formState, 'injury_mode')}>
                                <RadioGroup.Option
                                    value="sudden"
                                    text="Sudden"
                                    />
                                <RadioGroup.Option
                                    value="gradual"
                                    text="Gradual" />
                        </RadioGroup>
                    </div> 
                    <div className="flex1" style={{padding: '0px 15px' }}>
                        <h5> Circumstances </h5>
                        <RadioGroup 
                            name='circumstances'
                            value={_.get(formState, 'circumstances')}>
                                <RadioGroup.Option
                                    value="training"
                                    text="Training"
                                    />
                                <RadioGroup.Option
                                    value="competition"
                                    text="Competition" />
                                <RadioGroup.Option
                                    value="nonathletic"
                                    text="Non-Athletic" />
                        </RadioGroup>
                    </div> 
                </div>
                <div className={`flex gap-16 ${styles.formRow}`}>
                    <div className="flex1" style={{padding: '0px 0px' }}>
                        <h5> Injury location </h5>
                        <Select
                            name='injury_location'
                            value={_.get(formState, 'injury_location')} 
                            options={TrainingRecordOptions.INJURY_LOCATIONS}
                            placeholder="Location"
                        />
                    </div>
                    <div className="flex1" style={{padding: '0px 15px' }}>
                        <h5> Injury type </h5>
                        <Select
                            name='injury_type'
                            value={_.get(formState, 'injury_type')} 
                            options={TrainingRecordOptions.INJURY_TYPE}
                            placeholder="Type"
                        />
                    </div>
                    <div className="flex1" style={{padding: '0px 15px' }}>
                        <h5> Athletic participation </h5>
                        <Select
                            name='athletic_participation'
                            value={_.get(formState, 'athletic_participation')} 
                            options={TrainingRecordOptions.ATHLETIC_PARTICIPATION}
                            placeholder="Athletic Participation?"
                        />
                    </div>
                </div>
            </>
        );
    };

    return (
        <Modal show className={styles.TRRecordModal}> 
            <Modal.Header>
                <Modal.Title>
                    <h1>
                        <i className="icon icon-zap" />
                        {trRecord && _.get(trRecord, 'id')
                        ? 'Edit Training Diary'
                        : 'New Traning Diary'}
                    </h1>
                </Modal.Title>
                <Modal.Actions>
                    <button
                        className="btn btn-link btn-large btn-icon"
                        onClick={onHide}>
                            <i className="icon icon-x" /> 
                    </button>
                </Modal.Actions>
            </Modal.Header>
            <Modal.Body>
                <Form 
                    className={styles.form}
                    object={formState}
                    onChange={handleFormStateChange}>
                    {renderDiaryGeneral()}
                    {renderSleepDetails()}
                    {renderEmotions()}
                    {renderTrainingDetails()}
                    {renderInjuryDetals()}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {trRecord && trRecord.id ? (
                    <div>
                        <a 
                            className="btn btn-secondary"
                            onClick={onDelete}>
                                <i className="icon icon-trash" /> Archive Diary
                            </a>
                    </div>
                   ) : (
                        <div />
                    )}
                <Modal.Actions>
                    <button className="btn btn-secondary" onClick={onHide}>
                        Cancel
                    </button>
                    <button
                        disabled={
                            !hasChanged 
                        }
                        className="btn btn-primary"
                        onClick={onSave}>
                        Save
                    </button>
                </Modal.Actions> 
            </Modal.Footer>
        </Modal>
    );
}

function TRRecordViewHeader( {projectId} ) {
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
            <div className="flex flex-row" style={{alignItems: 'center'}}>
                <h3 style={{flex: 1, fontSize: '24px'}}> Daily Training Diary </h3>
                <div>
                    <button
                        className="btn btn-small btn-secondary"
                        onClick={() => setShowModal(true)}> 
                        <i className="icon icon-report" /> New Diary
                    </button>
                </div>
                {showModal ? (
                    <TRRecordViewModal onHide={() => setShowModal(false)} currentUser={currentUser} projectId={projectId}/>
                ): null}
            </div>
        </div>
    );
}

export const TRRecordViewContext = createContext({});
export function TRRecordView({ 
    fetcherFilters = {},
    loadingRecords = false,
    initialTRRecords = [],
    getTRRecords = () => {},
    page = 1,
    numPages = 1,
    projectId,
    coaching={},
}) {
    const [trRecords, setTRRecords] = useState(initialTRRecords);
    const debouncedGetTRRecords = useMemo(() => _.debounce(getTRRecords, 100), [getTRRecords]);
    const currentUser = useSelector(selectors.currentUser);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const chartInfo = {
        diaryRecord: coaching.chart_info ? coaching.chart_info.diary_record : null,
        diarySummary: coaching.output ? coaching.output.content[0]?.diary: '',
    };

    const handleRowClick = (record) => {
        setSelectedRecord(record);
    };

    const closeModal = () => {
        setSelectedRecord(null);
    };

    const deleteRecord = (deletedRecord) => {
        // Filter out the deleted record from the state
        const updatedRecords = trRecords.filter((record) => record.id !== deletedRecord.id);
        // Update the trRecords state
        setTRRecords(updatedRecords);  
    };

    useEffect(() => {
        setTRRecords(initialTRRecords);
    }, [initialTRRecords] );

    useEffect(() => {
        debouncedGetTRRecords({fetcherFilters, page});
    }, [debouncedGetTRRecords, fetcherFilters, page]);

    const renderDiaryStats = ( diary ) => {
        if (_.isNil(chartInfo.diaryRecord)) {
            return (<></>);
        }
        const {keys, values} = extractTimeSeries(chartInfo.diaryRecord);
        const series = [{name: 'Record count', data: values.slice(-7)}];
        const {summary} = chartInfo.diarySummary;
        return (
            <Card 
                title='Diary Statistics'>
                    <CardContent
                        desc={summary}
                        type='area'
                        series={series}
                        xaxis={keys.slice(-7)}
                        width={600}
                        height={200}
                        sideBySide={true}
                        title={'Accumulated Training Record (last 7 days)'}
                        />
            </Card>
        );
    };

    const renderTableHeader = () => {
        return (
            <div className="gap-16 text-small text-secondary"> 
                <div className="flex2"> Date </div>
                <div className="flex4 flex-center"> Title </div>
                <div className="flex2"> State of fitness </div>
                <div className="flex2"> Stress </div>
                <div className="flex2"> Training duration </div>
                <div className="flex2"> Running distnce </div>
                <div className="flex2"> Injury reported </div>
                <div 
                    className="flex flex0"
                    style={{
                        minWidth: 28,
                        maxWidth: 28,
                        justifyContent: 'center',
                    }}>
                    <i className="icon icon-more-horizontal"
                        style={{fontSize:18}}
                    />
                </div>
            </div>
        );
    };

    const renderTableRecord = (record) => {
        return (
            <div 
                key={record.id}
                onClick={() => handleRowClick(record)}>
                <div className="flex flex2 flex-col">
                    <div
                        className="flex flex-inline flex-wrap flex-center"
                        style={{columnGap: 8, rowGap: 2}}>
                        <span className="text-500">{record.record_date}</span>
                    </div>
                </div>
                <div className="flex flex4 flex-col">
                    <div
                        className="flex flex-inline flex-wrap flex-center"
                        style={{columnGap: 8, rowGap: 2}}>
                        <span className="text-500">{record.title}</span>
                    </div>
                </div>
                <div className="flex flex2 flex-col">
                    <div
                        className="flex flex-inline flex-wrap flex-center"
                        style={{columnGap: 8, rowGap: 2}}>
                        <span className="text-500">{record.state_of_fitness}</span>
                    </div>
                </div>
                <div className="flex flex2 flex-col">
                    <div
                        className="flex flex-inline flex-wrap flex-center"
                        style={{columnGap: 8, rowGap: 2}}>
                        <span className="text-500">{record.stress}</span>
                    </div>
                </div>
                <div className="flex flex2 flex-col">
                    <div
                        className="flex flex-inline flex-wrap flex-center"
                        style={{columnGap: 8, rowGap: 2}}>
                        <span className="text-500">{record.training_duration}</span>
                    </div>
                </div>
                <div className="flex flex2 flex-col">
                    <div
                        className="flex flex-inline flex-wrap flex-center"
                        style={{columnGap: 8, rowGap: 2}}>
                        <span className="text-500">{record.running_distance}</span>
                    </div>
                </div>
                <div className="flex flex2 flex-col">
                    <div
                        className="flex flex-inline flex-wrap flex-center"
                        style={{columnGap: 8, rowGap: 2}}>
                        <span className="text-500">{record.injury_location ? record.injury_location : 'None'}</span>
                    </div>
                </div>
                <div className="flex flex0 flex-col">
                    <div
                        className="flex flex-inline flex-wrap flex-center"
                        style={{columnGap: 8, rowGap: 0}}>
                        <i className="icon icon-edit"
                            style={{fontSize:18}}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.root2}>
            <TRRecordViewHeader projectId={projectId}/> 
            <div className={styles.contentArea}>
                <div className={styles.contentBody}>
                    <div className={styles.statBar}>
                        {renderDiaryStats()}
                    </div>
                    <div className={styles.table}>
                        <div className="flex">
                            <div className="flex flex1 flex-col">
                                <div className={styles.tableBody}>
                                    {renderTableHeader()}
                                    {trRecords.map((record) => record && record.id? renderTableRecord(record): null)}
                                    {selectedRecord && (<TRRecordViewModal deleteRecord={deleteRecord} onHide={closeModal} currentUser={currentUser} projectId={selectedRecord.project.id} trRecord={selectedRecord}/>)}
                                </div>
                                <div className={styles.bottomBar}>
                                    <div className={styles.pagination}>
                                        <Paginator 
                                            page={page}
                                            totalPages={numPages}
                                            handlePage={(page) =>
                                                getTRRecords({fetcherFilters, page})    
                                            }
                                            truncateTo={5}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
    
export function TRRecordContainer() { 
    const { projectId } = useParams();
    const [ breadcrumbItems, setBreadcrumbItems] = useState(['InjuryShield']); 
    const currentUser = useSelector(selectors.currentUser);
    
    const {
        loading: loadingRecords,
        trRecords,
        page,
        count,
        numPages,
        setPage,
        getTRRecords,
    } = useTRRecords();
    
    const dispatch = useDispatch();
    const [coaching, setCoaching] = useState({});
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {

        const fetchProjectDetails = async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}`);
                const data = await response.json();
                setBreadcrumbItems(['InjuryShield', data['response'].title, 'Training Diary']);

            } catch (error) {
                console.error('Error fetching project details:', error);
            }
        };

        const fetchCoachingSummary = async() => {
            try { 
                setLoading(true);
                dispatch(actions.TRInsight.trInsightsGetSummary({project_id:projectId, person_id:currentUser.id, pipeline_type:'coaching_summary'}))
                .withMeta.then((resp) => {
                    setCoaching(resp.response);
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error fetching project insights: ', error);
            }
        };
        fetchCoachingSummary();
        fetchProjectDetails();
    }, [projectId]);
    
    const currentPage = !_.isNil(numPages)
        ? Math.min(page, Math.max(numPages, 1))
        : page;

    const fetcherFilters = useMemo(() => _.omitBy({project_id: projectId, person_id: currentUser.id}, 
        (value) => (_.isBoolean(value) ? false : _.isEmpty(value)),), [projectId, currentUser.id]); 

    return (
        <div className={styles.root}>
            <ProjectSideNavContainer projectId={projectId}/>
            <div className = {styles.content}>
                <div className = {styles.TRRecordContainer}>
                    <TopMenuBarContainer breadcrumbItems={breadcrumbItems} />
                    {loading ? <Loading /> : 
                    <TRRecordView 
                        fetcherFilters={fetcherFilters}
                        initialTRRecords={trRecords}
                        loadingRecords={loadingRecords}
                        getTRRecords={getTRRecords}
                        page={currentPage}
                        numPages={numPages}
                        projectId={projectId}
                        coaching={coaching}/>
                    }
                </div>
            </div>
        </div>
    );
}

export default TRRecordContainer; 
