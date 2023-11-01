import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

import homeIcon from '../../../images/home.svg';
import chatIcon from '../../../images/message-square.svg';
import trendIcon from '../../../images/trending-up.svg';
import searchIcon from '../../../images/search.svg';
import userIcon from '../../../images/user.svg';
import discIcon from '../../../images/disc.svg';
import logIcon from '../../../images/list.svg';
import chartIcon from '../../../images/bar-chart.svg';
import terminalIcon from '../../../images/terminal.svg';
import settingIcon from '../../../images/settings.svg';
import iShieldIcon from '../../../images/InjuryShield.svg';
import styles from './ProjectSideNav.scss';

const IconButton = ({ icon, linkTo }) => {
    const history = useHistory();
    const handleClick = () => {
        history.push(linkTo);
    };

    return (
      <button className={styles.iconButton} onClick={handleClick}>
        <span className={styles.icon}>{icon}</span>
      </button>
    );
};

const LoadIcon = ({iconName, height, width, desc}) => {
    const h = height? height: '20px';
    const w = width? width: '20px';
    const theme = useSelector((state) => state.appData.theme );

    const className = theme === 'light'? styles.filterWhite2: styles.filterWhite;
    return (
            <img src={iconName} className={className} height={h} width={w} alt={desc} />
    );
};

const ProjectSideNav = ({projectId}) => {
    const projectHome = '/project/' + projectId;

    return (
        <div className={styles.projectSideNavContainer}>
            <div className = {styles.projectAppContainer}>
                <div className = {styles.projectAppHome}>
                    <div className={styles.iconBox}>
                        <IconButton icon={<LoadIcon iconName={iShieldIcon} height='27px' width='30px' desc='Pristine AI'/>} linkTo='/home' /> 
                    </div>
                    <div className={styles.iconBox}>
                        <IconButton icon={<LoadIcon iconName={homeIcon} desc='Home' />} linkTo={projectHome} /> 
                    </div>
                </div>
                <div className = {styles.projectAppGroup}>
                    <div className={styles.iconBox}>
                        <IconButton icon={<LoadIcon iconName={chartIcon} desc='Report' />} linkTo={projectHome + "/insight"}/> 
                    </div>
                    <div className={styles.iconBox}>
                        <IconButton icon={<LoadIcon iconName={trendIcon} desc='Database' />} linkTo={projectHome + "/predict"} /> 
                    </div>
                    <div className={styles.iconBox}>
                        <IconButton icon={<LoadIcon iconName={logIcon} desc='Logs' />} linkTo={projectHome + "/diary"}/> 
                    </div>
                </div>
                <div className = {styles.projectAppGroup}>
                    <div className={styles.iconBox}>
                        <IconButton icon={<LoadIcon iconName={chatIcon} desc='Chat' />} linkTo={projectHome + "/chat"}/> 
                    </div>
                    <div className={styles.iconBox}>
                        <IconButton icon={<LoadIcon iconName={settingIcon} desc='Settings' />} linkTo={projectHome + "/settings"}/> 
                    </div>
                </div>
            </div>
            <footer>
                <div className = {styles.projectUserContainer}>
                    <div className = {styles.projectUserGroup}>
                        <div className={styles.iconBox}>
                            <IconButton icon={<LoadIcon iconName={searchIcon} desc='Search' />} linkTo={projectHome}/> 
                        </div>
                        <div className={styles.iconBox}>
                            <IconButton icon={<LoadIcon iconName={userIcon} desc='User settings' />} linkTo={projectHome}/> 
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export class ProjectSideNavContainer extends React.Component {

    render() {
        return <ProjectSideNav {...this.props} />;
    }
}
