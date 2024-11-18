import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Form, Button, Row, Col, Alert, Modal } from 'react-bootstrap';
import FullscreenLoader from "../components/FullscreenLoader.jsx";
import { useNavigate } from 'react-router-dom';

const RegistrationPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [qrCode, setQrCode] = useState(null);
    const [message, setMessage] = useState({
        type: '',
        message: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        if (Object.keys(errors)?.length > 0) {
            return;
        }
        try {
            setIsLoading(true);
            const response = await axios.post('http://localhost:3000/api/auth/register', data);
            setQrCode(response.data.qrCode);
            setMessage({
                type: 'success',
                message: response.data.message || 'Registration successful!',
            });
            setShowModal(true);
        } catch (error) {
            setMessage({
                type: 'error',
                message: error?.response?.data?.error || 'Registration failed. Try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="container mt-5">
            <FullscreenLoader show={isLoading}/>

            <h1>Register</h1>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username"
                                {...register('username', {required: true})}
                                isInvalid={!!errors.username}
                            />
                            {errors.username && (
                                <Form.Control.Feedback type="invalid">
                                    Username is required
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter password"
                                {...register('password', {required: true, minLength: 6})}
                                isInvalid={!!errors.password}
                            />
                            {errors.password && (
                                <Form.Control.Feedback type="invalid">
                                    Password is required and must be at least 6 characters.
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter first name"
                                {...register('firstName', {required: true})}
                                isInvalid={!!errors.firstName}
                            />
                            {errors.firstName && (
                                <Form.Control.Feedback type="invalid">
                                    First name is required
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter last name"
                                {...register('lastName', {required: true})}
                                isInvalid={!!errors.lastName}
                            />
                            {errors.lastName && (
                                <Form.Control.Feedback type="invalid">
                                    Last name is required
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Age</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter age"
                                {...register('age', {required: true, min: 1})}
                                isInvalid={!!errors.age}
                            />
                            {errors.age && (
                                <Form.Control.Feedback type="invalid">
                                    Age is required
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Gender</Form.Label>
                            <Form.Select {...register('gender', {required: true})} isInvalid={!!errors.gender}>
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </Form.Select>
                            {errors.gender && (
                                <Form.Control.Feedback type="invalid">
                                    Gender is required
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        {...register('email', {required: true})}
                        isInvalid={!!errors.email}
                    />
                    {errors.email && (
                        <Form.Control.Feedback type="invalid">
                            Email is required
                        </Form.Control.Feedback>
                    )}
                </Form.Group>
                <Button type="submit" className="btn btn-primary w-100">Register</Button>
            </Form>

            {message.type === 'error' && <Alert variant="danger" className="mt-3">{message.message}</Alert>}

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Registration Successful</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Scan the QR Code below with your authenticator app:</p>
                    {qrCode && <img src={qrCode} alt="QR Code for 2FA" className="img-fluid"/>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleLoginRedirect}>
                        Login
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className="mt-3 text-center">
                <p>Already have an account?</p>
                <Button
                    variant="outline-secondary"
                    onClick={handleLoginRedirect}
                >
                    Login
                </Button>
            </div>
        </div>
    );
};

export default RegistrationPage;
