import {NestedRoutes} from 'wolf/router';

import styles from './Project.scss';
import {ProjectSideNavContainer} from 'components/Projects/ProjectSideNav';

export default class Project extends React.Component {

  render() {
    const { projectId } = this.props.match.params;

    return (
      <div className={styles.root}>
        <ProjectSideNavContainer projectId={projectId}/>
        <div className={styles.content}>
          <NestedRoutes routes={this.props.routes}/>
        </div>
      </div>
    );
  }
}
