import React from 'react';

export default function UserPanel() {
    return (
        <div className="user_div">
            <h5 className="brand-name mb-4">
                Epic HR
                <a href="javascript:void(0)" className="user_btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2" /><path d="M15 12h-12l3 -3" /><path d="M6 15l-3 -3" /></svg>
                </a>
            </h5>
            <div className="card">
                <div className="card-body">
                    <div className="media">
                        <img className="avatar avatar-xl mr-3" src="/assets/images/sm/avatar1.jpg" alt="avatar" />
                        <div className="media-body">
                            <h5 className="m-0">Sara Hopkins</h5>
                            <p className="text-muted mb-0">Webdeveloper</p>
                            <ul className="social-links list-inline mb-0 mt-2">
                                <li className="list-inline-item"><a href="javascript:void(0)" title="" data-toggle="tooltip" data-original-title="Facebook"><i className="fa fa-facebook"></i></a></li>
                                <li className="list-inline-item"><a href="javascript:void(0)" title="" data-toggle="tooltip" data-original-title="Twitter"><i className="fa fa-twitter"></i></a></li>
                                <li className="list-inline-item"><a href="javascript:void(0)" title="" data-toggle="tooltip" data-original-title="1234567890"><i className="fa fa-phone"></i></a></li>
                                <li className="list-inline-item"><a href="javascript:void(0)" title="" data-toggle="tooltip" data-original-title="@skypename"><i className="fa fa-skype"></i></a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-header border-bottom">
                    <h3 className="card-title">Statistics</h3>
                    <div className="card-options">
                        <a href="#" className="card-options-collapse" data-toggle="card-collapse"><i className="fe fe-chevron-up"></i></a>
                        <a href="#" className="card-options-remove" data-toggle="card-remove"><i className="fe fe-x"></i></a>
                    </div>
                </div>
                <div className="card-body">
                    <div className="text-center">
                        <div className="row">
                            <div className="col-6 pb-3">
                                <label className="mb-0">Balance</label>
                                <h4 className="font-30 font-weight-bold">$545</h4>
                            </div>
                            <div className="col-6 pb-3">
                                <label className="mb-0">Growth</label>
                                <h4 className="font-30 font-weight-bold">27%</h4>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="d-block">Total Income<span className="float-right">77%</span></label>
                        <div className="progress progress-xs">
                            <div className="progress-bar bg-blue" role="progressbar" aria-valuenow={77} aria-valuemin={0} aria-valuemax={100} style={{ width: "77%" }}></div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="d-block">Total Expenses <span className="float-right">50%</span></label>
                        <div className="progress progress-xs">
                            <div className="progress-bar bg-danger" role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100} style={{ width: "50%" }}></div>
                        </div>
                    </div>
                    <div className="form-group mb-0">
                        <label className="d-block">Gross Profit <span className="float-right">23%</span></label>
                        <div className="progress progress-xs">
                            <div className="progress-bar bg-green" role="progressbar" aria-valuenow={23} aria-valuemin={0} aria-valuemax={100} style={{ width: "23%" }}></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card">
                <div className="card-header border-bottom">
                    <h3 className="card-title">Friends</h3>
                    <div className="card-options">
                        <a href="#" className="card-options-collapse" data-toggle="card-collapse"><i className="fe fe-chevron-up"></i></a>
                        <a href="#" className="card-options-remove" data-toggle="card-remove"><i className="fe fe-x"></i></a>
                    </div>
                </div>
                <div className="card-body">
                    <ul className="right_chat list-unstyled">
                        <li className="online">
                            <a href="javascript:void(0);">
                                <div className="media">
                                    <img className="media-object " src="/assets/images/xs/avatar4.jpg" alt="" />
                                    <div className="media-body">
                                        <span className="name">Donald Gardner</span>
                                        <span className="message">Designer, Blogger</span>
                                        <span className="badge badge-outline status"></span>
                                    </div>
                                </div>
                            </a>
                        </li>
                        <li className="online">
                            <a href="javascript:void(0);">
                                <div className="media">
                                    <img className="media-object " src="/assets/images/xs/avatar5.jpg" alt="" />
                                    <div className="media-body">
                                        <span className="name">Wendy Keen</span>
                                        <span className="message">Java Developer</span>
                                        <span className="badge badge-outline status"></span>
                                    </div>
                                </div>
                            </a>
                        </li>
                        <li className="offline">
                            <a href="javascript:void(0);">
                                <div className="media">
                                    <img className="media-object " src="/assets/images/xs/avatar2.jpg" alt="" />
                                    <div className="media-body">
                                        <span className="name">Matt Rosales</span>
                                        <span className="message">CEO, Epic Theme</span>
                                        <span className="badge badge-outline status"></span>
                                    </div>
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="card b-none">
                <ul className="list-group">
                    <li className="list-group-item d-flex">
                        <div className="box-icon sm rounded bg-blue"><i className="fa fa-credit-card"></i> </div>
                        <div className="ml-3">
                            <div>+$29 New sale</div>
                            <a href="javascript:void(0)">Admin Template</a>
                            <div className="text-muted font-12">5 min ago</div>
                        </div>
                    </li>
                    <li className="list-group-item d-flex">
                        <div className="box-icon sm rounded bg-pink"><i className="fa fa-upload"></i> </div>
                        <div className="ml-3">
                            <div>Project Update</div>
                            <a href="javascript:void(0)">New HTML page</a>
                            <div className="text-muted font-12">10 min ago</div>
                        </div>
                    </li>
                    <li className="list-group-item d-flex">
                        <div className="box-icon sm rounded bg-teal"><i className="fa fa-file-word-o"></i> </div>
                        <div className="ml-3">
                            <div>You edited the file</div>
                            <a href="javascript:void(0)">reposrt.doc</a>
                            <div className="text-muted font-12">11 min ago</div>
                        </div>
                    </li>
                    <li className="list-group-item d-flex">
                        <div className="box-icon sm rounded bg-cyan"><i className="fa fa-user"></i> </div>
                        <div className="ml-3">
                            <div>New user</div>
                            <a href="javascript:void(0)">Puffin web - view</a>
                            <div className="text-muted font-12">17 min ago</div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}