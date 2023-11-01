import { TopMenuBarContainer } from 'components/ui/TopMenuBar';
import styles from './Account.scss';
import DropdownMenu from 'components/ui/DropdownMenu';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2'; 
import * as storage from 'util/storage';
import { useDispatch, useSelector } from 'react-redux';
import {useState} from 'react';
import {connect} from 'react-redux';
import DashboardSideNavContainer from 'components/Dashboard/DashboardSideNav';
import RadioGroup from 'components/ui/RadioGroup';
import DatePicker from 'components/ui/DatePicker';
import Select from 'components/ui/Select';
import moment from 'moment';
import * as actions from 'actions';

const TextInput = ({ placeholder, value, onChange }) => (
  <input
    type="text"
    placeholder={placeholder}
    className={styles.inputField}
    value={value}
    onChange={onChange}
  />
);

const RadioGroupReuse = ({ value, options, onChange }) => (
  <RadioGroup value={value} onChange={onChange} asRow>
    {options.map((option) => (
      <RadioGroup.Option 
        key={option.value} 
        value={option.value} 
        text={option.text} />
    ))}
  </RadioGroup>
);

const SelectInput = ({ name, placeholder, value, options, onChange }) => (
  <Select
    name={name}
    placeholder={placeholder}
    value={value}
    options={options}
    onChange={onChange}
  />
);

const PreferenceRow = ({label, children}) => (
  <div className={styles.preferenceRow}>
    <div className={styles.text}>{label}</div>
    <div className={styles.input}>{children}</div>
  </div>
);

const Preference = () => {
  const options = [
    { key: 'light', label: 'Light', icon: <HiOutlineSun/>},
    { key: 'dark', label: 'Dark', icon: <HiOutlineMoon/>},
  ];
  const cur_option = storage.getItem('App.theme') === 'light' ? options[0]: options[1]; 
  const currentUser = useSelector((state) => state.appData.currentUser);
  const [hasChanged, setHasChanged] = useState(false); 
  const dispatch = useDispatch();
  const [updatedUser, setUpdatedUser] = useState(currentUser);
  const curTheme = useSelector((state) => state.appData.theme);
  
  const handleSelect = (option) => {
    let theme = curTheme; 
    if (option && option.label === 'Dark') {
      theme = 'dark';
    } else {
      theme = 'light';
    }

    dispatch(actions.changeTheme(theme)); 
    const html = document.querySelector('html');
    html.dataset.theme = `${theme}`;
  };

  const saveUserProfile = () => {
    dispatch(actions.Person.PersonUpdateSave(updatedUser));
    setHasChanged(false);
  };

  const updateUser = (field, value) => {
    setUpdatedUser({...updatedUser, ...{[field]: value}}); 
    setHasChanged(true);
  };

  return (
    <div className={styles.preferenceDashboardContainer}>
      <div className={styles.preferenceContainer}> 
        <div className={styles.preferenceRowTitle}>
          Account Information
        </div>
        <PreferenceRow label="Username">
          <TextInput
            placeholder={currentUser.user.username}
            value={currentUser.user.username}
            onChange={() => {}}
            disabled={true}
          />
        </PreferenceRow>
        <PreferenceRow label="Email">
          <TextInput
            placeholder={updatedUser.email}
            value={updatedUser.email}
            onChange={() => {}}
            disabled={true}
          />
        </PreferenceRow>
      </div>
      <div className={styles.preferenceContainer}> 
        <div className={styles.preferenceRowTitle}>
          <div> Profile </div>
          {hasChanged && <button className="btn btn-primary" 
                                 onClick={saveUserProfile}
                                 style={{marginRight:25, paddingTop: -10, height: 30}}
                                 > Save </button>}
        </div>
        <PreferenceRow label="First name">
          <TextInput
            value={updatedUser.first_name}
            onChange={(e) => updateUser('first_name', e.target.value)}
          />
        </PreferenceRow>
        <PreferenceRow label="Last name">
          <TextInput
            value={updatedUser.last_name}
            onChange={(e) => updateUser('last_name', e.target.value)}
          />
        </PreferenceRow>
        <PreferenceRow label="Sex">
          <RadioGroupReuse
            value={updatedUser.sex}
            options={[
              { value: 'male', text: 'Male' },
              { value: 'female', text: 'Female' },
              { value: 'unknown', text: 'No disclosure' },
            ]}
            onChange={(e) => updateUser('sex', e.target.value)}
          />
        </PreferenceRow>
        <PreferenceRow label="Birthday"> 
          <DatePicker
              show
              name="birth_date"
              dateFormat="MM/DD/YYYY" 
              selected={updatedUser.birthday? moment(updatedUser.birthday, 'YYYY-MM-DD'):moment('2014-01-01', 'YYYY-MM-DD')} 
              onChange={(e) => updateUser('birthday', e.format('YYYY-MM-DD'))} 
              className={styles.inputField} 
          />
        </PreferenceRow>
        <PreferenceRow label="Weight (lb)">
          <TextInput
            value={updatedUser.weight}
            onChange={(e) => updateUser('weight', e.target.value)} 
          />
        </PreferenceRow>
        <PreferenceRow label="Height (ft)">
          <TextInput
            value={updatedUser.height}
            onChange={(e) => updateUser('height', e.target.value)} 
          />
        </PreferenceRow>
        <PreferenceRow label="Favorite Sport">
          <SelectInput
            name="favorite_sport"
            value={updatedUser.favorite_sport}
            options={[{label: 'Running', value: 'running'}, {label: 'Cycling', value: 'cycling'}]} 
            onChange={(e) => updateUser('favorite_sport', e.value)}
          />
        </PreferenceRow>
        <PreferenceRow label="Skill Level">
          <SelectInput
            name="skill_level"
            value={updatedUser.skill_level}
            options={[{label: 'Novice', value: 'novice'}, {label: 'Intermdiate', value: 'intermediate'}, {label: 'Master', value: 'master'}, {label: 'Elite', value: 'elite'}]} 
            onChange={(e) => updateUser('skill_level', e.value)}
          />
        </PreferenceRow>
        <PreferenceRow label="Years of Participation">
          <TextInput
            name="years_of_participation"
            value={updatedUser.years_of_participation}
            onChange={(e) => updateUser('years_of_participation', e.target.value)}
          />
        </PreferenceRow>
      </div>
      <div className={styles.preferenceContainer}> 
        <div className={styles.preferenceRowTitle}>
          Theme
        </div>
        <PreferenceRow label="Interface theme">
          <div className={styles.inputMenu}> 
            <DropdownMenu cur={cur_option} options={options} onSelect={handleSelect} /> 
          </div>
        </PreferenceRow>
      </div>
    </div>
  );
};

export const Account = (props) => {
  const breadcrumbItems = ['Home', 'Preferences'];
  return (
        <div className={styles.content}>
          <TopMenuBarContainer breadcrumbItems={breadcrumbItems} /> 
          {<Preference />}
        </div>
  );
};
  
@connect(
  ({appData}) => {
    return {currentUser: appData.currentUser};
  },
  {
  }
)  
export class AccountContainer extends React.Component {
    render() {
      return (
        <div className={styles.account}>
            <DashboardSideNavContainer title='Account' currentUser={this.props.currentUser}/>
            <Account {...this.props} />
        </div>
      );
    }
}

export default Preference;
