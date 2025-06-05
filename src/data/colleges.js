// 学院列表数据
export const collegeOptions = [
  '计算机工程学院',
  '商学院',
  '电气工程学院',
  '通信工程学院',
  '电子工程学院'
]

// 获取学院列表
export const getCollegeOptions = () => {
  return collegeOptions
}

// 验证学院是否有效
export const isValidCollege = (college) => {
  return collegeOptions.includes(college)
} 