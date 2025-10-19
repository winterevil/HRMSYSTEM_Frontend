import React from 'react';

export default function JobDashboardPage() {
    return (
        <div className="section-body mt-3">
            <div className="container-fluid">
                <div className="row clearfix row-deck">
                    <div className="col-lg-6 col-md-12">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Top Locations</h3>
                                <div className="card-options">
                                    <a href="javascript:void(0)" className="card-options-remove" data-toggle="card-remove"><i className="fa-solid fa-x"></i></a>
                                    <div className="item-action dropdown ml-2">
                                        <a href="javascript:void(0)" data-toggle="dropdown"><i className="fa-solid fa-ellipsis-vertical"></i></a>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-eye"></i> View Details </a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-share-alt"></i> Share </a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-cloud-download"></i> Download</a>
                                            <div className="dropdown-divider"></div>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-copy"></i> Copy to</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-folder"></i> Move to</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-edit"></i> Rename</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-trash"></i> Delete</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div id="world-map-markers" className="jvector-map" style={{ height: "300px" }} ></div>
                            </div>
                            <div className="card-footer">
                                <div className="row">
                                    <div className="col-xl-4 col-md-12">
                                        <div className="clearfix">
                                            <div className="float-left"><strong>35%</strong></div>
                                            <div className="float-right"><small className="text-muted">2018</small></div>
                                        </div>
                                        <div className="progress progress-xs">
                                            <div className="progress-bar bg-gray" role="progressbar" style={{ width: "35%" }} aria-valuenow={42} aria-valuemin={0} aria-valuemax={100}></div>
                                        </div>
                                        <span className="text-uppercase font-10">USA</span>
                                    </div>
                                    <div className="col-xl-4 col-md-12">
                                        <div className="clearfix">
                                            <div className="float-left"><strong>61%</strong></div>
                                            <div className="float-right"><small className="text-muted">2018</small></div>
                                        </div>
                                        <div className="progress progress-xs">
                                            <div className="progress-bar bg-gray" role="progressbar" style={{ width: "61%" }} aria-valuenow={42} aria-valuemin={0} aria-valuemax={100}></div>
                                        </div>
                                        <span className="text-uppercase font-10">India</span>
                                    </div>
                                    <div className="col-xl-4 col-md-12">
                                        <div className="clearfix">
                                            <div className="float-left"><strong>37%</strong></div>
                                            <div className="float-right"><small className="text-muted">2018</small></div>
                                        </div>
                                        <div className="progress progress-xs">
                                            <div className="progress-bar bg-gray" role="progressbar" style={{ width: "37%" }} aria-valuenow={37} aria-valuemin={0} aria-valuemax={100}></div>
                                        </div>
                                        <span className="text-uppercase font-10">Australia</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Job View</h3>
                                <div className="card-options">
                                    <a href="javascript:void(0)" className="card-options-remove" data-toggle="card-remove"><i className="fa-solid fa-x"></i></a>
                                    <div className="item-action dropdown ml-2">
                                        <a href="javascript:void(0)" data-toggle="dropdown"><i className="fa-solid fa-ellipsis-vertical"></i></a>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-eye"></i> View Details </a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-share-alt"></i> Share </a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-cloud-download"></i> Download</a>
                                            <div className="dropdown-divider"></div>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-copy"></i> Copy to</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-folder"></i> Move to</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-edit"></i> Rename</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-trash"></i> Delete</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="row text-center">
                                    <div className="col-lg-4 col-sm-12 border-right">
                                        <label className="mb-0 font-10">All Time</label>
                                        <h4 className="font-20 font-weight-bold">2,025</h4>
                                    </div>
                                    <div className="col-lg-4 col-sm-12 border-right">
                                        <label className="mb-0 font-10">Last Month</label>
                                        <h4 className="font-20 font-weight-bold">754</h4>
                                    </div>
                                    <div className="col-lg-4 col-sm-12">
                                        <label className="mb-0 font-10">Today</label>
                                        <h4 className="font-20 font-weight-bold">54</h4>
                                    </div>
                                </div>
                                <table className="table table-striped mt-4">
                                    <tr>
                                        <td>
                                            <label className="d-block">Biology - BIO <span className="float-right">43%</span></label>
                                            <div className="progress progress-xs">
                                                <div className="progress-bar bg-lightgray" role="progressbar" style={{ width: "43%" }} aria-valuenow={43} aria-valuemin={0} aria-valuemax={100}></div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label className="d-block">Business Analysis - BUS <span className="float-right">27%</span></label>
                                            <div className="progress progress-xs">
                                                <div className="progress-bar bg-lightgray" role="progressbar" style={{ width: "27%" }} aria-valuenow={27} aria-valuemin={0} aria-valuemax={100}></div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label className="d-block">Computer Technology - CT <span className="float-right">81%</span></label>
                                            <div className="progress progress-xs">
                                                <div className="progress-bar bg-lightgray" role="progressbar" style={{ width: "81%" }} aria-valuenow={77} aria-valuemin={0} aria-valuemax={100}></div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label className="d-block">Management - MGT <span className="float-right">61%</span></label>
                                            <div className="progress progress-xs">
                                                <div className="progress-bar bg-lightgray" role="progressbar" style={{ width: "61%" }} aria-valuenow={77} aria-valuemin={0} aria-valuemax={100}></div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label className="d-block">Angular Dev <span className="float-right">77%</span></label>
                                            <div className="progress progress-xs">
                                                <div className="progress-bar bg-lightgray" role="progressbar" style={{ width: "77%" }} aria-valuenow={77} aria-valuemin={0} aria-valuemax={100}></div>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            <div className="card-footer">
                                <small>Measure How Fast You re Growing Monthly Recurring Revenue. <a href="#">Learn More</a></small>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Current job Openings</h3>
                                <div className="card-options">
                                    <a href="javascript:void(0)" className="card-options-remove" data-toggle="card-remove"><i className="fa-solid fa-x"></i></a>
                                    <div className="item-action dropdown ml-2">
                                        <a href="javascript:void(0)" data-toggle="dropdown"><i className="fa fa-ellipsis-vertical"></i></a>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-eye"></i> View Details </a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-share-alt"></i> Share </a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-cloud-download"></i> Download</a>
                                            <div className="dropdown-divider"></div>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-copy"></i> Copy to</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-folder"></i> Move to</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-edit"></i> Rename</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-trash"></i> Delete</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-vcenter table_custom spacing5 mb-0">
                                        <tbody>
                                            <tr>
                                                <td className="w40">
                                                    <i className="flag flag-us" data-toggle="tooltip" title="" data-original-title="flag flag-us"></i>
                                                </td>
                                                <td>
                                                    <small>United States</small>
                                                    <h5 className="mb-0">434</h5>
                                                </td>
                                                <td>
                                                    <span className="chart">5,3,7,8,6,1,4,9</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <i className="flag flag-au" data-toggle="tooltip" title="" data-original-title="flag flag-au"></i>
                                                </td>
                                                <td>
                                                    <small>Australia</small>
                                                    <h5 className="mb-0">215</h5>
                                                </td>
                                                <td>
                                                    <span className="chart">4,2,2,5,6,9,8,1</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <i className="flag flag-ca" data-toggle="tooltip" title="" data-original-title="flag flag-ca"></i>
                                                </td>
                                                <td>
                                                    <small>Canada</small>
                                                    <h5 className="mb-0">105</h5>
                                                </td>
                                                <td>
                                                    <span className="chart">7,5,3,9,5,1,4,6</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <i className="flag flag-gb" data-toggle="tooltip" title="" data-original-title="flag flag-gb"></i>
                                                </td>
                                                <td>
                                                    <small>United Kingdom</small>
                                                    <h5 className="mb-0">250</h5>
                                                </td>
                                                <td>
                                                    <span className="chart">3,5,6,4,9,5,5,2</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <i className="flag flag-nl" data-toggle="tooltip" title="" data-original-title="flag flag-nl"></i>
                                                </td>
                                                <td>
                                                    <small>Netherlands</small>
                                                    <h5 className="mb-0">52</h5>
                                                </td>
                                                <td>
                                                    <span className="chart">8,2,1,5,6,3,4,9</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card-footer">
                                <small>Measure How Fast You re Growing Monthly Recurring Revenue. <a href="#">Learn More</a></small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row clearfix row-deck">
                    <div className="col-lg-12 col-md-12 col-sm-12">
                        <div className="card">
                            <div className="card-header border-bottom">
                                <h3 className="card-title">Recent Applicants</h3>
                                <div className="card-options">
                                    <a href="javascript:void(0)" className="card-options-remove" data-toggle="card-remove"><i className="fa fa-x"></i></a>
                                    <div className="item-action dropdown ml-2">
                                        <a href="javascript:void(0)" data-toggle="dropdown"><i className="fa fa-ellipsis-vertical"></i></a>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-eye"></i> View Details </a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-share-alt"></i> Share </a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-cloud-download"></i> Download</a>
                                            <div className="dropdown-divider"></div>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-copy"></i> Copy to</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-folder"></i> Move to</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-edit"></i> Rename</a>
                                            <a href="javascript:void(0)" className="dropdown-item"><i className="dropdown-icon fa fa-trash"></i> Delete</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover table-striped table-vcenter mb-0">
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th>Name</th>
                                                <th>Apply for</th>
                                                <th>Date</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="w60">
                                                    <div className="avtar-pic w35 bg-red" data-toggle="tooltip" data-placement="top" title="Avatar Name"><span>MN</span></div>
                                                </td>
                                                <td>
                                                    <div className="font-15">Marshall Nichols</div>
                                                    <span className="text-muted">marshall-n@gmail.com</span>
                                                </td>
                                                <td><span>Full-stack developer</span></td>
                                                <td>24 Jun, 2015</td>
                                                <td>
                                                    <a href="javascript:void(0);" className="btn btn-info btn-round">Interview</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="w60">
                                                    <img src="../assets/images/xs/avatar1.jpg" data-toggle="tooltip" data-placement="top" title="Avatar Name" alt="Avatar" className="w35 h35 rounded"/>
                                                </td>
                                                <td>
                                                    <div className="font-15">Susie Willis</div>
                                                    <span className="text-muted">sussie-w@gmail.com</span>
                                                </td>
                                                <td><span>Designer</span></td>
                                                <td>28 Jun, 2015</td>
                                                <td>
                                                    <a href="javascript:void(0);" className="btn btn-info btn-round">Interview</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="w60">
                                                    <div className="avtar-pic w35 bg-pink" data-toggle="tooltip" data-placement="top" title="Avatar Name"><span>MN</span></div>
                                                </td>
                                                <td>
                                                    <div className="font-15">Debra Stewart</div>
                                                    <span className="text-muted">debra@gmail.com</span>
                                                </td>
                                                <td><span>Project Manager</span></td>
                                                <td>21 July, 2015</td>
                                                <td>
                                                    <a href="javascript:void(0);" className="btn btn-danger btn-round">Cancel</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="w60">
                                                    <img src="../assets/images/xs/avatar2.jpg" data-toggle="tooltip" data-placement="top" title="Avatar Name" alt="Avatar" className="w35 h35 rounded"/>
                                                </td>
                                                <td>
                                                    <div className="font-15">Francisco Vasquez</div>
                                                    <span className="text-muted">francisv@gmail.com</span>
                                                </td>
                                                <td><span>Senior Developer</span></td>
                                                <td>18 Jan, 2016</td>
                                                <td>
                                                    <a href="javascript:void(0);" className="btn btn-info btn-round">Interview</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="w60">
                                                    <img src="../assets/images/xs/avatar3.jpg" data-toggle="tooltip" data-placement="top" title="Avatar Name" alt="Avatar" className="w35 h35 rounded"/>
                                                </td>
                                                <td>
                                                    <div className="font-15">Jane Hunt</div>
                                                    <span className="text-muted">jane-hunt@gmail.com</span>
                                                </td>
                                                <td><span>Front-end Developer</span></td>
                                                <td>08 Mar, 2016</td>
                                                <td>
                                                    <a href="javascript:void(0);" className="btn btn-success btn-round">Interviewed</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}