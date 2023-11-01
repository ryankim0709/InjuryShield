import {connect} from 'react-redux';

import ProjectDashBoardContainer from 'components/Projects/ProjectDashboard';
import {TopMenuBarContainer} from 'components/ui/TopMenuBar';
import DashboardSideNavContainer from 'components/Dashboard/DashboardSideNav';

import styles from './Home.scss';
import * as actions from 'actions';

const DashboardHome = () => { 
  const breadcrumbItems = ['Home', 'Trainings']; 
  return (
    <div className={styles.content}> 
      <TopMenuBarContainer breadcrumbItems={breadcrumbItems} /> 
      <ProjectDashBoardContainer />
    </div>
  );
};

@connect(
  ({appData}) => {
    return {currentUser: appData.currentUser};
  },
  {
    ...actions,
  }
)
export class HomeContainer extends React.Component {

  render() {
    return (
      <div className={styles.home}>
          <DashboardSideNavContainer title='Dashboard' currentUser={this.props.currentUser}/>
          <DashboardHome />
      </div>
    );
  }
}
