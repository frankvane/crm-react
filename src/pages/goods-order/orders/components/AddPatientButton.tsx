import React from "react";
import styles from "../style.module.less";

interface AddPatientButtonProps {
	onClick?: () => void;
}

const AddPatientButton: React.FC<AddPatientButtonProps> = ({ onClick }) => {
	return (
		<button className={styles.addPatientButton} onClick={onClick}>
			新增病患
		</button>
	);
};

export default AddPatientButton;
