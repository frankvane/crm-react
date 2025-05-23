/**
 * @file 文件描述
 * @author 开发人员
 * @date YYYY-MM-DD
 * @last_modified_by 最后修改人
 * @last_modified_time YYYY-MM-DD
 */
import {
	useMutation,
	useQuery,
	useQueryClient,
	UseMutationOptions,
} from "@tanstack/react-query";
import {
	createPatient,
	deletePatient,
	updatePatient,
	getPatient,
} from "@/api/modules/patient";

export const useCreatePatientMutation = (
	options?: UseMutationOptions<any, Error, any>,
) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createPatient,
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["patients"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
};

export const useDeletePatientMutation = (
	options?: UseMutationOptions<any, Error, number>,
) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deletePatient,
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["patients"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
};

export const useUpdatePatientMutation = (
	options?: UseMutationOptions<any, Error, { id: number; data: any }>,
) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }) => updatePatient(id, data),
		...options,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["patients"] });
			options?.onSuccess?.(data, variables, context);
		},
	});
};

export const usePatientQuery = (id: number, options?: any) => {
	return useQuery({
		queryKey: ["patient", id],
		queryFn: () => getPatient(id),
		enabled: !!id,
		...options,
	});
};
