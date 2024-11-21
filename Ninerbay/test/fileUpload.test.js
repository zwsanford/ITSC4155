import { expect } from 'chai';
import { randomImageName, getFileUrl, deleteFile } from '../middleware/fileUpload.js';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';

const s3Mock = mockClient(S3Client);

describe('fileUpload.js', () => {
  beforeEach(() => {
    s3Mock.reset();
  });

  describe('randomImageName', () => {
    it('should generate a random hex string of the specified length', () => {
      const name = randomImageName(16);
      expect(name).to.be.a('string');
      expect(name).to.have.lengthOf(32);
    });
  });

  describe('getFileUrl', () => {
    it('should generate a signed URL for a given key', async () => {
      s3Mock.on(GetObjectCommand).resolves({});
      const url = await getFileUrl('test-key');
      expect(url).to.be.a('string');
    });

    it('should throw an error if S3 operation fails', async () => {
      s3Mock.on(GetObjectCommand).rejects(new Error('S3 Error'));
      try {
        await getFileUrl('test-key');
      } catch (err) {
        expect(err.message).to.equal('S3 Error');
      }
    });
  });

  describe('deleteFile', () => {
    it('should delete a file from S3', async () => {
      s3Mock.on(DeleteObjectCommand).resolves({});
      await deleteFile('test-key');
      expect(s3Mock.calls()).to.have.lengthOf(1);
    });

    it('should throw an error if S3 delete operation fails', async () => {
      s3Mock.on(DeleteObjectCommand).rejects(new Error('S3 Error'));
      try {
        await deleteFile('test-key');
      } catch (err) {
        expect(err.message).to.equal('S3 Error');
      }
    });
  });
});