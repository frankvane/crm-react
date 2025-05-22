import {
	useMutation,
	useQueryClient,
	UseMutationOptions,
} from "@tanstack/react-query";
import { createMedicalRecord } from "@/api/modules/medicalRecord";

export const useCreateMedicalRecordMutation = (
	options?: UseMutationOptions<any, Error, any>,
) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createMedicalRecord,
		...options,
		onSuccess: (data, variables, context) => {
			// 可根据实际情况刷新病例列表
			queryClient.invalidateQueries({
				queryKey: ["medicalRecords", variables?.patient_id],
			});
			options?.onSuccess?.(data, variables, context);
		},
	});
};
