import React, {useState, useEffect, useContext} from 'react';
import { Carousel, Button, Modal, Form, Card } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import PortfolioService from '../services/portfolio.service.js';
import 'react-toastify/dist/ReactToastify.css';
import {useRole} from "../components/RoleContext.jsx";
import FullscreenLoader from "../components/FullscreenLoader.jsx";

const PortfolioPage = () => {
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({ title: '', description: '', images: [''] });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { role } = useRole();

    const fetchPortfolioItems = async () => {
        try {
            setIsLoading(true)
            const items = await PortfolioService.getAll();
            setPortfolioItems(items);
        } catch (error) {
            toast.error('Failed to fetch portfolio items.');
        } finally {
            setIsLoading(false)
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setShowModal(false)
        const { title, description, images } = modalData;
        const data = { title, description, images };

        try {
            if (isEditing) {
                setIsLoading(true)
                await PortfolioService.update(modalData._id, data);
                toast.success('Portfolio item updated successfully.');
            } else {
                await PortfolioService.create(data);
                toast.success('Portfolio item created successfully.');
            }
            fetchPortfolioItems();
            setShowModal(false);
        } catch (error) {
            toast.error('Failed to create/update portfolio item.');
        }
        finally {
            setIsLoading(false)
        }
    };

    const handleDelete = async (id) => {
        try {
            setIsLoading(true)
            await PortfolioService.delete(id);
            toast.success('Portfolio item deleted successfully.');
            fetchPortfolioItems();
        } catch (error) {
            toast.error('Failed to delete portfolio item.');
        }
        finally {
            setIsLoading(false)
        }
    };

    const handleImageChange = (index, value) => {
        const updatedImages = [...modalData.images];
        updatedImages[index] = value;
        setModalData({ ...modalData, images: updatedImages });
    };

    const addImageInput = () => {
        setModalData({ ...modalData, images: [...modalData.images, ''] });
    };

    const removeImageInput = (index) => {
        const updatedImages = modalData.images.filter((_, i) => i !== index);
        setModalData({ ...modalData, images: updatedImages });
    };

    useEffect(() => {
        fetchPortfolioItems();
    }, []);

    return (
        <div className="container mt-5">
            <ToastContainer />
            <FullscreenLoader show={isLoading} />
            <h1>Portfolio</h1>
            {role === 'admin' && (
                <Button onClick={() => {
                    setIsEditing(false);
                    setModalData({ title: '', description: '', images: [''] });
                    setShowModal(true);
                }}>Add Portfolio Item</Button>
            )}
            <div className="mt-4 row">
                {portfolioItems.map(item => (
                    <div key={item._id} className="col-md-4 mb-4">
                        <Card className="shadow-sm">
                            <Carousel>
                                {item.images.map((img, index) => (
                                    <Carousel.Item key={index}>
                                        <img
                                            style={{ height: 300, objectFit: 'cover' }}
                                            src={img}
                                            className="d-block w-100"
                                            alt={`Slide ${index}`}
                                        />
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                            <Card.Body>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text>{item.description}</Card.Text>
                                <p><small>Created: {new Date(item.createdAt).toLocaleString()}</small></p>
                                <div className="d-flex justify-content-between">
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                            setIsEditing(true);
                                            setModalData(item);
                                            setShowModal(true);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    {role === 'admin' && (
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDelete(item._id)}
                                        >
                                            Delete
                                        </Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Edit' : 'Create'} Portfolio Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreateOrUpdate}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={modalData.title}
                                onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={modalData.description}
                                onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Images</Form.Label>
                            {modalData.images.map((image, index) => (
                                <div key={index} className="d-flex align-items-center mb-2">
                                    <Form.Control
                                        type="text"
                                        placeholder={`Image URL ${index + 1}`}
                                        value={image}
                                        onChange={(e) => handleImageChange(index, e.target.value)}
                                        required
                                    />
                                    <Button
                                        variant="danger"
                                        onClick={() => removeImageInput(index)}
                                        className="ms-2"
                                        disabled={modalData.images.length === 1}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={addImageInput}>
                                Add Image
                            </Button>
                        </Form.Group>
                        <Button type="submit" className="w-100">{isEditing ? 'Update' : 'Create'}</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default PortfolioPage;
