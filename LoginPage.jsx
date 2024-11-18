import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthService from "../services/auth.service.js";
import {useRole} from "../components/RoleContext.jsx";

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [message, setMessage] = useState('');
    const [show2FA, setShow2FA] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setRole } = useRole();

    const onSubmit = async (data) => {
        setLoading(true);
        setMessage('');
        try {
            const loginData = await AuthService.login(data.username, data.password, data.twoFACode);

            if (loginData?.accessToken) {
                const profile = await AuthService.getProfile();
                if(profile?.role) {
                    setRole(profile.role);
                }
                navigate('/');
            }
        } catch (error) {
            if (error.response?.data?.error === '2FA code is required') {
                setShow2FA(true);
            } else {
                setMessage(error.response?.data?.error || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterRedirect = () => {
        navigate('/register');
    };

    return (
        <div className="container mt-5">
            <h1>Login</h1>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        {...register('username', { required: true })}
                        isInvalid={!!errors.username}
                    />
                    {errors.username && (
                        <Form.Control.Feedback type="invalid">
                            Username is required
                        </Form.Control.Feedback>
                    )}
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Enter password"
                        {...register('password', { required: true })}
                        isInvalid={!!errors.password}
                    />
                    {errors.password && (
                        <Form.Control.Feedback type="invalid">
                            Password is required
                        </Form.Control.Feedback>
                    )}
                </Form.Group>

                {show2FA && (
                    <Form.Group className="mb-3">
                        <Form.Label>2FA Code</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter 2FA code"
                            {...register('twoFACode', { required: show2FA })}
                            isInvalid={!!errors.twoFACode}
                        />
                        {errors.twoFACode && (
                            <Form.Control.Feedback type="invalid">
                                2FA code is required
                            </Form.Control.Feedback>
                        )}
                    </Form.Group>
                )}

                <Button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                            Logging in...
                        </>
                    ) : (
                        'Login'
                    )}
                </Button>
            </Form>

            {message && <Alert variant="danger" className="mt-3">{message}</Alert>}

            <div className="mt-3 text-center">
                <p>Don't have an account?</p>
                <Button
                    variant="outline-secondary"
                    onClick={handleRegisterRedirect}
                >
                    Register
                </Button>
            </div>
        </div>
    );
};

export default LoginPage;
