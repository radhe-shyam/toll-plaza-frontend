import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const initialFormData = { registrationNumber: '', direction: true, isReturnable: false };
    const [receiptData, setReceiptData] = useState({});
    const [formData, setFormData] = useState(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const handleInputChange = event => {
        const { value } = event.target;
        setFormData({ ...formData, registrationNumber: value.toUpperCase() });
    };
    const handleDirectionButton = event => {
        setFormData({ ...formData, direction: event.target.name === 'Entering' ? true : false });
        event.preventDefault();
    };
    const handleTollForButton = event => {
        setFormData({ ...formData, isReturnable: event.target.name === 'true' ? true : false });
        event.preventDefault();
    };

    const generateReceipt = async event => {
        event.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        try {
            const cancelToken = axios.CancelToken.source();
            const { data } = await axios.post(
                'https://toll-plaza-backend.herokuapp.com/api/receipt/generate',
                formData,
                {
                    cancelToken: cancelToken.token
                }
            );
            setReceiptData(data.data);
            setIsLoading(false);
            setFormData(initialFormData);
            document.getElementsByName('registrationNumber')[0].focus();

            return data;
        } catch (err) {
            setIsLoading(false);
            return "Translation can't be done because of invalid key";
        }
    }
    return (
        <div>
            <br />
            <h1 className="ui header center aligned sixteen wide">Toll Plaza</h1>
            <div className="ui center aligned basic segment divider">
                <form onSubmit={generateReceipt}>
                    <div className="ui equal width form">
                        <div className="fields">
                            <div className="field">
                                <label>Registration Number</label>
                                <input type="text" required autoFocus pattern="^[a-zA-Z0-9]{6,10}$" placeholder="Registration Number" name='registrationNumber' onChange={handleInputChange} value={formData.registrationNumber} />
                            </div>
                            <div className="field">
                                <label>Direction</label>
                                <div className="ui buttons">
                                    <input type="button" name="Entering" onClick={handleDirectionButton} className={`ui button ${formData.direction ? 'active purple' : ''}`} value="Entering" />
                                    <div className="or"></div>
                                    <input type="button" value="Exiting" name="Exiting" onClick={handleDirectionButton} className={`ui button ${formData.direction ? '' : 'active purple'}`} />
                                </div>
                            </div>
                            <div className="field">
                                <label>Toll for</label>
                                <div className="ui buttons">
                                    <input type="button" value="One Way" name="false" onClick={handleTollForButton} className={`ui button ${formData.isReturnable ? '' : 'active purple'}`} />
                                    <div className="or"></div>
                                    <input type="button" value="Return" name="true" onClick={handleTollForButton} className={`ui button ${formData.isReturnable ? 'active purple' : ''}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />

                    <div className="ui horizontal divider">
                        <button type="submit" className={`positive ui button large ${isLoading ? 'loading disabled' : ''}`} >Generate Receipt</button>
                    </div>
                </form>
                {
                    (receiptData._id) ? (<div className="two wide">
                        <table className="two wide ui small table left aligned">
                            <thead className="center aligned">
                                <tr>
                                    <th colSpan="2">NHAI Toll Plaza Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Token Number</td>
                                    <td>{receiptData._id}</td>
                                </tr>
                                <tr>
                                    <td>Created on</td>
                                    <td>{new Date(receiptData.createdOn).toLocaleString()}</td>
                                </tr>
                                {(receiptData.returnOn) ? (<tr>
                                    <td>Returned on</td>
                                    <td>{new Date(receiptData.returnOn).toLocaleString()}</td>
                                </tr>) : null}
                                <tr>
                                    <td>Direction</td>
                                    <td>{receiptData.direction ? 'Entering' : 'Exiting'}</td>
                                </tr>
                                <tr>
                                    <td>Registration Number</td>
                                    <td>{receiptData.registrationNumber}</td>
                                </tr>
                                <tr>
                                    <td>Toll paid for</td>
                                    <td>{receiptData.isReturnable ? 'Return' : 'One way'}</td>
                                </tr>
                                <tr>
                                    <td>Fee</td>
                                    <td>Rs. {receiptData.fee}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th>Amount Payable</th>
                                    <th>Rs. {receiptData.returnOn ? 0 : receiptData.fee}</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>) : null
                }
            </div>
        </div>
    );
}

export default App;
