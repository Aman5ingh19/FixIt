import api from './api';

const uploadApi = {
  async uploadImages(files, folder = 'requests') {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const response = await api.post(`/uploads/images?folder=${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteImage(publicId) {
    const response = await api.delete(`/uploads/${encodeURIComponent(publicId)}`);
    return response.data;
  },
};

export default uploadApi;
