import React from 'react';

import styles from './TopMenuBar.scss';
import bellIcon from '../../../fonts/icomoon/svg/bell.svg';
import helpIcon from '../../../fonts/icomoon/svg/help-circle.svg';
import searchIcon from '../../../fonts/icomoon/svg/search.svg';
import * as storage from 'wolf/util/storage';
import { useSelector } from 'react-redux';

const Breadcrumb = ({ items }) => {
    return (
      <div className={styles.breadcrumb}>
        {items.map((item, index) => (
          <span key={index} className={styles.breadcrumbItem}>
            {item} /
          </span>
        ))}
      </div>
    );
};

const IconButton = ({ icon }) => {
    return (
      <button className={styles.iconButton}>
        <span className={styles.icon}>{icon}</span>
      </button>
    );
};

const IconWithTextButton = ({ icon, text }) => {
    return (
      <button className={styles.iconButton}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.text}>{text}</span>
      </button>
    );
};

const Icon = ({ src, alt }) => {
    const theme = useSelector((state) => state.appData.theme);

    const className = theme === 'light'? styles.filterWhite2: styles.filterWhite;
    return <img src={src} className={className} height="15px" width="15px" alt={alt}/>;
};

const TopMenuBar = ({breadcrumbItems}) => {

    return (
       <div className={styles.topBarMenuContainer}>
            <div className={styles.topBarMenu}>
                <div className={styles.breadcrumbContainer}> 
                    <Breadcrumb items={breadcrumbItems} /> 
                </div>
                <div className={styles.topBarMenuLeft}> 
                    <div className={styles.search}>
                        <IconButton icon={<Icon src={searchIcon} alt="Search Icon" />} /> 
                    </div>
                    <div className={styles.help}>
                        <IconWithTextButton icon={<Icon src={helpIcon} alt="Help Icon" />} text="Help" /> 
                    </div>
                    <div className={styles.notification}>
                        <IconButton icon={<Icon src={bellIcon} alt="Bell Icon" />} /> 
                    </div>
                </div>
            </div>
        </div>
    );
  };
  
  
export class TopMenuBarContainer extends React.Component {
    render() {
      return <TopMenuBar {...this.props} />;
    }
}
  