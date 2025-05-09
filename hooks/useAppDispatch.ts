// src/hooks/useAppDispatch.ts
import { AppDispatch } from '@/redux-saga/store';
import { useDispatch } from 'react-redux';

const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;