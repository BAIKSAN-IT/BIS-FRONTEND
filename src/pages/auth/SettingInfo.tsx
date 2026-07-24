import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Navigate, Link, useNavigate } from "react-router-dom";
import { Button, Alert, Row, Col, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import classNames from "classnames";
import generateSHA256Hash from "../../utils/generateSHA256Hash";
import { withSwal } from "react-sweetalert2";
import { changePass, logoutUser } from "../../redux/common/authSlice";

import { RootState, AppDispatch } from "../../redux/store";

import { VerticalForm, FormInput } from "../../components/";
import { Payload } from "../../constants/common/common";

import AuthLayout from "./AuthLayout";
import { env } from "process";
//import { userInfo } from "os";
import UserProfile from "../apps/SocialFeed/UserProfile";
import Users from "../other/SearchResults/Users";
import Logout from "./Logout";
import {isEmpty,} from "../../utils/CommonUtil";

interface UserData {
  userId: string;
  userName: string;
  password: string;
  newPassword: string;
  cfmPassword: string
}

/* bottom links */
const BottomLink = () => {
  const { t } = useTranslation();
  
  return (
    <Row className="mt-3">
      <Col className="text-center">
        <p className="text-white-50">
          {t("Please Login again.")}{" "}
          <Link to={"/auth/login"} className="text-white ms-1">
            <b>{t("LOGIN")}</b>
          </Link>
        </p>
      </Col>
    </Row>
  );
};


const SettingInfo = withSwal((props: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { swal } = props;
  const navigate = useNavigate();
 
  const [userInfo, setUserInfo] = useState<UserData>({
    userId: "",
    userName: "",
    password: "",
    newPassword: "",
    cfmPassword: "",
  }); 


  const { userEnvInfo } = useSelector((state: RootState) => ({
    userEnvInfo: state.Tablet.userEnvInfo,
  }));

  const { user } = useSelector((state: RootState) => ({
    user: state.Auth.user,
  }));

  const { loading, userSignUp, error } = useSelector((state: RootState) => ({
    loading: state.Auth.loading,
    error: state.Auth.error,
    userSignUp: state.Auth.userSignUp,
  }));

  useEffect(() => {
    if (isEmpty(user?.userId)) {
        navigate("/auth/login");
      }
    }, []);

  const schemaResolver = yupResolver(
      yup.object().shape({
        password: yup.string().required(t("Please enter Current Password")),  
        newPassword: yup.string().required(t("Please enter New Password")),
        cfmPassword: yup.string().required(t("Please enter Confirm Password")),
    })
  );

    /*
   * handle form submission
   */
  const onSubmit = (formData: UserData) => {
   
    window.ui.modal.open("confirmPop");

    let params = {
      userId: formData["userId"], 
      userName: formData["userName"], 
      password: generateSHA256Hash(formData["password"]),
      newPassword: generateSHA256Hash(formData["newPassword"]),
      cfmPassword: generateSHA256Hash(formData["cfmPassword"]),
    };

    if ((params.password) !== (user?.loginPwd)) {       
      swal.fire({title: "Passwords do not match!"});
      //window.ui.modal.toast("Passwords do not match!");
      return;
    }


    if ((params.password) === (params.newPassword)) {       
      swal.fire({title: "Password error!.<br>Current password and new password is same"});
      //window.ui.modal.toast("Current password and new password is same!");
      return;
    }

    if ((params.newPassword) !== (params.cfmPassword)) {       
      swal.fire({title: "New password error!.<br>New password and confirm password is not same"});      
      return;
    }


    dispatch(changePass(params)).then((res) => {
  
      const payload = res.payload as Payload;

      if (payload.status === 200) {
        dispatch(logoutUser());
        swal.fire({title: "Password changed successfully.<br>Please Log in."});
           //navigate("/auth/login");
           //alert("Password changed successfully. Please Log in.");
           //navigate(-1);
        navigate("/auth/login");
      } else {
          swal.fire({title: "Failed to change the password.<br>Try again."});
        }
    });  
  };

  return (
    <>
      {userSignUp ? <Navigate to={"/auth/confirm"}></Navigate> : null}

      <AuthLayout
        helpText={t(
          "Please enter the password you want to change."
        )}
        bottomLinks={<BottomLink />}
      >
        {error && (
          <Alert variant="danger" className="my-2">
            {error}
          </Alert>
        )}

        <VerticalForm<UserData>
          onSubmit={onSubmit}
          resolver={schemaResolver}
          defaultValues={{}}
        >
          <FormInput
             // label={t("User ID")} 
              type="text"
              name="userId"
              value={user?.userId as string}
              containerClass={"mb-3"}
              style={{
                backgroundColor: "#CD5C5C",
                color: "white",
                fontSize: "18px",
                textAlign: "center",
              }}
              readOnly
          />                                    
          <FormInput
              //label={t("User Name")}
              type="text"
              name="username"
              value={user?.userNm as string}
              containerClass={"mb-3"}
              style={{
                backgroundColor: "#CD5C5C",
                color: "white",
                fontSize: "18px",
                textAlign: "center",
              }}
              readOnly
          />                  
          <FormInput
              label={t("Current Password")}
              type="password"
              name="password"
              placeholder={t("Enter your Current password")}
              containerClass={"mb-3"}
          />                  
          <FormInput
              label={t("New Password")}
              type="password"
              name="newPassword"
              placeholder={t("Enter your new password")}
              containerClass={"mb-3"}
          />    
          <FormInput
              label={t("Confirm Password")}              
              type="password"
              name="cfmPassword"
              placeholder={t("Enter your confirm password")}
              containerClass={"mb-3"}
          />   
          <Row>
            <Col>
              <div className="text-center d-grid">
                <Button variant="success" type="submit" disabled={loading}>
                  {t("CONFIRM")}
                </Button>
              </div>
            </Col>
            <Col>
              <div className="text-center d-grid">
                <Button variant="secondary" type="button" 
                        onClick={() => navigate(-1)}
                >
                {t("CANCEL")}
                </Button>
              </div>
          </Col>
          </Row>
        </VerticalForm>
      </AuthLayout>
    </>
  );
});

export default SettingInfo;
