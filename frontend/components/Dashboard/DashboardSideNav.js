import { useSelector } from 'react-redux';
import styles from './DashboardSideNav.scss';
import { Link } from 'react-router-dom';

const DashboardSideNav = ({ title }) => {
    const orgs = useSelector((state) => state.orm.organizations);
    const orgsTmp = Object.values(orgs.models);
  
    function renderNavItemGroup(title, items) {
        return (
          <div className={styles.sideItemContainer}>
            <div className={styles.sideItem}>
              <div className={styles.title}>{title}</div>
            </div>
            <div className={styles.sideItemList}>
              {items.map((item) => (
                <div className={styles.sideItem} key={item.text}>
                  <Link to={item.to} title={title}>
                    <div className={styles.linked}>{item.text}</div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        );
      }
  
    function renderLogoutButton() {
      const handleLogout = () => {
        const confirmLogout = window.confirm('Are you sure you want to logout?');
        if (confirmLogout) {
          window.location.href = '/authentication/logout';
        }
      };
  
      return (
        <div className={styles.sideItemContainer}>
          <div className={styles.sideItem}>
            <div className={styles.linked}>
              <button onClick={handleLogout}>
                <i className={`icon icon-log-out ${styles.logoutIcon}`} />
                <span className={styles.logout}>Logout</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.dashboardSideNavContainer}>
        <div className={styles.topTitle}>
          <div className={styles.titleBox}>{title}</div>
        </div>
        {renderNavItemGroup('Trainings', [{ to:'/home', text:'All Trainings'}])}
        {renderNavItemGroup('Organizations', orgsTmp.map((org) => ({ to: `/org/${org.slug}`, text: org.name})))}
        {renderNavItemGroup('Account', [{ to: '/account', text: 'User Profile' },])}
        {renderLogoutButton()}
      </div>
    );
  };
  
export default class DashboardSideNavContainer extends React.Component {
    render() {
      return <DashboardSideNav{...this.props} />;
    }
}
