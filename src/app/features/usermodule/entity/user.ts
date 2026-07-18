import {UserType} from './usertype';
import {UserStatus} from './userstatus';

export class User{
  id!:number;
  username!:string;
  password!:string;
  usertype!:UserType;
  userstatus!:UserStatus;
  remarks!:string;
}
