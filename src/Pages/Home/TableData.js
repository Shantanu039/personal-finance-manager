import React, { useEffect, useState } from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import moment from "moment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LoopIcon from "@mui/icons-material/Loop";
import "./home.css";
import { deleteTransactions, editTransactions } from "../../utils/ApiRequest";
import axios from "axios";

const TableData = ({ data, user, onRefresh }) => {
  const [show, setShow] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currId, setCurrId] = useState(null);
  const [recurring, setRecurring] = useState(false);
  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  useEffect(() => {
    console.log("TableData transactions:", data);
  }, [data]);

  const handleEditClick = (item) => {
    setCurrId(item._id);
    setEditingTransaction(item);
    setRecurring(item.recurring || false);
    setValues({
      title: item.title,
      amount: item.amount,
      description: item.description,
      category: item.category,
      date: moment(item.date).format("YYYY-MM-DD"),
      transactionType: item.transactionType,
    });
    setShow(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const { data } = await axios.put(`${editTransactions}/${currId}`, {
      ...values,
      recurring,
    });

    if (data.success) {
      setShow(false);
      onRefresh();
    }
  };

  const handleDeleteClick = async (itemId) => {
    const { data } = await axios.post(`${deleteTransactions}/${itemId}`, {
      userId: user._id,
    });

    if (data.success) {
      onRefresh();
    }
  };

  return (
    <Container>
      <Table responsive="md" className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Category</th>
            <th>Recurring</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody className="text-white">
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item._id}>
                <td>{moment(item.date).format("YYYY-MM-DD")}</td>
                <td>{item.title}</td>
                <td>{item.amount}</td>
                <td>{item.transactionType}</td>
                <td>{item.category}</td>
                <td>{item.recurring ? <LoopIcon sx={{ color: "orange" }} /> : null}</td>
                <td>
                  <div className="icons-handle">
                    <EditNoteIcon sx={{ cursor: "pointer" }} onClick={() => handleEditClick(item)} />
                    <DeleteForeverIcon sx={{ color: "red", cursor: "pointer" }} onClick={() => handleDeleteClick(item._id)} />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px", fontSize: "18px", color: "gray" }}>
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {editingTransaction && (
        <Modal show={show} onHide={() => setShow(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Update Transaction Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEditSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control name="title" type="text" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control name="amount" type="number" value={values.amount} onChange={(e) => setValues({ ...values, amount: e.target.value })} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select name="category" value={values.category} onChange={(e) => setValues({ ...values, category: e.target.value })}>
                  <option value="Groceries">Groceries</option>
                  <option value="Rent">Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="Tip">Tip</option>
                  <option value="Food">Food</option>
                  <option value="Medical">Medical</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" name="description" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Transaction Type</Form.Label>
                <Form.Select name="transactionType" value={values.transactionType} onChange={(e) => setValues({ ...values, transactionType: e.target.value })}>
                  <option value="credit">Credit</option>
                  <option value="expense">Expense</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" name="date" value={values.date} onChange={(e) => setValues({ ...values, date: e.target.value })} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check type="checkbox" label="Recurring Transaction" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
              </Form.Group>

              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                <Button variant="primary" type="submit">Submit</Button>
              </Modal.Footer>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
};

export default TableData;