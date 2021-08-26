// import request from '@/utils/request'
import axios from 'axios'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';

// 查询节点类型列表
export function listType() {
  console.log("listType:");
  return axios({
    method:'get',
    url:'http://192.168.0.122:8080/allSlaves',
    params:{}
  })
}

// 查询节点类型详细
export function getType(data) {
  console.log("data:",data);
  return axios({
    url: 'http://192.168.0.122:8080/selectSlave/',
    method: 'get',
    params: data
  })
}

// 新增节点类型
export function addType(data) {
  console.log("新增:",data)
  return axios({
    url: 'http://192.168.0.122:8080/addSlave',
    method: 'get',
    params: data
  })
}

// // 修改节点类型
export function updateType(data) {
  console.log("修改节点类型",data);
  return axios({
    url: 'http://192.168.0.122:8080/updateSlave',
    method: 'get',
    params: data
  })
}

// 删除节点类型
export function delType(data) {
  console.log("delete-id:",data);
  return axios({
    url: 'http://192.168.0.122:8080/deleteSlave',
    method: 'get',
    params: data
  })
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//简单查询api
export function selectList(data) {
  return axios({
    url: 'http://192.168.0.122:8080/query',
    method: 'post',
    data: data,
  })
}

export function insertList(data) {
  return axios({
    url: 'http://192.168.0.122:8080/query',
    method: 'post',
    data: data,
  })
}

export function deleteList(data) {
  return axios({
    url: 'http://192.168.0.122:8080/query',
    method: 'post',
    data: data,
  })
}

export function updateList(data) {
  return axios({
    url: 'http://192.168.0.122:8080/query',
    method: 'post',
    data: data,
  })
}

export function getAllList(data) {
  return axios({
    url: 'http://192.168.0.122:8080/query',
    method: 'post',
    data: data,
  })
}
