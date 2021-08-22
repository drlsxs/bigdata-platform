// 表单重置
export function resetForm(refName) {
	if (this.$refs[refName]) {
		this.$refs[refName].resetFields();
	}
}

//对象数组转单个对象
export const toObject = (arr, key) => arr.reduce((a, b) => ({...a, [b[key]]: b}), {});

