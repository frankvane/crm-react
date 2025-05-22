import React, { useState } from 'react';
import SearchArea from './components/SearchArea';
import AddPatientButton from './components/AddPatientButton';
import PatientList from './components/PatientList';
import PatientModal from './components/PatientModal';
import styles from './style.module.less';

const OrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.topBar}>
          <SearchArea onSearch={setSearchParams} />
          <AddPatientButton onClick={() => setModalVisible(true)} />
        </div>
        <PatientList searchParams={searchParams} />
      </div>
      <PatientModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </div>
  );
};

export default OrdersPage;
