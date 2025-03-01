import "./home.css";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { addTransaction, getTransactions } from "../../utils/ApiRequest";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import Analytics from "./Analytics";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";

const Home = () => {
  const navigate = useNavigate();

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  const [cUser, setcUser] = useState();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");
  const [recurring, setRecurring] = useState(false);

  const handleStartChange = (date) => {
    setStartDate(date);
  };

  const handleEndChange = (date) => {
    setEndDate(date);
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    const avatarFunc = async () => {
      if (localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user.isAvatarImageSet === false || user.avatarImage === "") {
          navigate("/setAvatar");
        }
        setcUser(user);
        setRefresh(true);
      } else {
        navigate("/login");
      }
    };

    avatarFunc();
  }, [navigate]);

  const [values, setValues] = useState({
    title: "",
    amount: "",
    description: "",
    category: "",
    date: "",
    transactionType: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleChangeFrequency = (e) => {
    setFrequency(e.target.value);
  };

  const handleSetType = (e) => {
    setType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, amount, description, category, date, transactionType } =
      values;

    if (
      !title ||
      !amount ||
      !description ||
      !category ||
      !date ||
      !transactionType
    ) {
      toast.error("Please enter all the fields", toastOptions);
      return;
    }
    setLoading(true);

    try {
      const { data } = await axios.post(addTransaction, {
        title: title,
        amount: amount,
        description: description,
        category: category,
        date: date,
        transactionType: transactionType,
        recurring: recurring,
        userId: cUser._id,
      });

      if (data.success === true) {
        toast.success(data.message, toastOptions);
        handleClose();
        setRefresh(!refresh); // Toggle the refresh state
      } else {
        toast.error(data.message, toastOptions);
      }
    } catch (error) {
      toast.error("Error adding transaction!", toastOptions);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setType("all");
    setStartDate(null);
    setEndDate(null);
    setFrequency("7");
  };

  const fetchAllTransactions = async () => {
    if (!cUser || !cUser._id) {
      console.error("User not defined");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(getTransactions, {
        userId: cUser._id,
        frequency: frequency,
        startDate: startDate,
        endDate: endDate,
        type: type,
      });

      console.log("Fetched transactions:", data.transactions); // Debugging
      setTransactions(data.transactions); // Update the state
      setLoading(false);
    } catch (err) {
      console.error("Error fetching transactions:", err); // Debugging
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cUser && cUser._id) {
      fetchAllTransactions();
    }
  }, [refresh, frequency, endDate, type, startDate, cUser]);

  const handleTableClick = () => {
    setView("table");
  };

  const handleChartClick = () => {
    setView("chart");
  };

  console.log("Current view:", view); // Debugging
  console.log("Rendering:", view === "table" ? "TableData" : "Analytics"); // Debugging

  return (
    <>
      <Header />

      {loading ? (
        <Spinner />
      ) : (
        <Container className="mt-3">
          <div className="filterRow">
            <div className="text-white">
              <Form.Group className="mb-3" controlId="formSelectFrequency">
                <Form.Label>Select Frequency</Form.Label>
                <Form.Select name="frequency" value={frequency} onChange={handleChangeFrequency}>
                  <option value="7">Last Week</option>
                  <option value="30">Last Month</option>
                  <option value="365">Last Year</option>
                  <option value="custom">Custom</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="text-white type">
              <Form.Group className="mb-3" controlId="formSelectType">
                <Form.Label>Type</Form.Label>
                <Form.Select name="type" value={type} onChange={handleSetType}>
                  <option value="all">All</option>
                  <option value="expense">Expense</option>
                  <option value="credit">Income</option>
                </Form.Select>
              </Form.Group>
            </div>

            <div className="text-white iconBtnBox">
              <FormatListBulletedIcon sx={{ cursor: "pointer" }} onClick={handleTableClick} />
              <BarChartIcon sx={{ cursor: "pointer" }} onClick={handleChartClick} />
            </div>

            <div>
              <Button onClick={handleShow} className="addNew">Add New</Button>
              <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Add Transaction Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Group className="mb-3" controlId="formRecurring">
                      <Form.Check
                        type="checkbox"
                        label="Recurring Transaction"
                        checked={recurring}
                        onChange={(e) => setRecurring(e.target.checked)}
                      />
                    </Form.Group>
                    {/* Existing Form Inputs */}
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>Close</Button>
                  <Button variant="primary" onClick={handleSubmit}>Submit</Button>
                </Modal.Footer>
              </Modal>
            </div>
          </div>

          {view === "table" ? (
            <TableData data={transactions} user={cUser} onRefresh={() => setRefresh(!refresh)} />
          ) : (
            <Analytics transactions={transactions} user={cUser} />
          )}
          <ToastContainer />
        </Container>
      )}
    </>
  );
};

export default Home;