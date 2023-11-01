import {ProjectSideNavContainer} from 'components/Projects/ProjectSideNav';
import styles from './ProjectSetting.scss';
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import { TopMenuBarContainer } from 'components/ui/TopMenuBar';
import Preference from 'components/Account/Account';

const ProjectSetting = () => { 

    return (
        <div>
            <Preference/>
        </div>
    );
};

const ProjectSettingContainer = () => {
    const { projectId } = useParams();
    const [ projectDetails, setProjectDetails ] = useState(null);
    const [ breadcrumbItems, setBreadcrumbItems ] = useState(['InjuryShield']);

    useEffect(() => {

        const fetchChatDetails = async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}`);
                const data = await response.json();
                setProjectDetails(data['response']);
                setBreadcrumbItems(['InjuryShield', data['response'].title, 'setting']);

            } catch (error) {
                console.error('Error fetching project settings:', error);
            }
        };

        fetchChatDetails();
    }, [projectId]);

    return (
        <div className={styles.root}>
            <ProjectSideNavContainer projectId={projectId}/>
            <div className = {styles.content}>
                <TopMenuBarContainer breadcrumbItems={breadcrumbItems} />
                {projectDetails && <ProjectSetting chatDetails={projectDetails}/>}
            </div>
        </div>
    );
};

export default ProjectSettingContainer;
