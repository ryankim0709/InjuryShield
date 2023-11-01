import _ from 'lodash';
import {connect} from 'react-redux';

import {NestedRoutes} from 'router';
import styles from './App.scss';

const html = document.querySelector('html');
html.dataset.theme = storage.getItem('App.theme') || 'light';
storage.setItem('App.theme', html.dataset.theme);

@connect(
  ({appLoading}) => {
    return {
      appLoading,
    };
  },
  {
  },
)
export class App extends React.Component {
  state = {};
  componentDidMount() {
    this.props.setAppLoading(true);

  componentDidUpdate(prevProps, prevState) {
  }

  render() {
    const { appLoading } = this.props;
    if (appLoading) {
      return (
        <div className='center'>
          {
            console.log('Loading ... ')
          }
        </div>
      );
    }

    return (
      <div className={styles.root}>
        <div className={styles.content}> 
          <NestedRoutes routes={this.props.routes}/>
        </div>
      </div>
    );
  }
}
