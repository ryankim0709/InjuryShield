import { useState, useEffect } from 'react';
import styles from './ProjectDashboard.scss';
import Card from 'components/ui/Card';
import PopupMenu from 'components/ui/Popup';
import {useDispatch, useSelector} from 'react-redux';
import * as selectors from 'selectors';
import * as actions from 'actions';

const ProjectDashboard = () => { 
  const [projectList, setProjectList] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUser = useSelector(selectors.currentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProjectList = async () => {
      try {
        dispatch(actions.Project.projectsGetList({person_id: currentUser.id}))
        .withMeta.then((resp) => {
          setProjectList(resp.response);
        });
      } catch (error) {
        console.error('Error fetching project details: ', error);
      }
    };

    fetchProjectList();
  }, []);

  const handleMenuClick = (e) => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  return (
    <div className={styles.projectDashboardContainer}>
    <div className={styles.existingProjectArea}>
      {projectList ? (projectList.map((organizationProjects) => (
        <div key={organizationProjects.org_title} className={styles.projectOrgContainer}>
          <div className={styles.projectOrgTitle}>
            Injury Shield for {organizationProjects.org_title}
            <div className={styles.projectList}>
              {organizationProjects && organizationProjects.projects.map((project) => (
                <div className={styles.cardWrapper} key={project.id}> 
                  <Card key={project.id} title={project.title} linkTo={`project/${project.id}/diary`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))
      ) : (
        <p> Loading project list ...</p>
      )}
    </div>
  </div>
);
};
  
  
export default class ProjectDashboardContainer extends React.Component {

  render() {
    return (
      <div className={styles.content}>
          <ProjectDashboard/>
      </div>
    );
  }
}
  
